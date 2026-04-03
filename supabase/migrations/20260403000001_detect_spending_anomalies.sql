-- Detects high-signal financial anomalies for Lemon Coach.
-- Returns category spend spikes, missing recurring expenses, and budget overrun trajectories.

CREATE OR REPLACE FUNCTION public.detect_spending_anomalies(p_user_id UUID)
RETURNS TABLE (
  anomaly_type text,
  category text,
  description text,
  severity text,
  current_value numeric,
  reference_value numeric,
  metadata jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_month date := date_trunc('month', now())::date;
  v_days_elapsed integer := GREATEST(EXTRACT(day FROM now())::integer, 1);
  v_days_in_month integer := EXTRACT(day FROM (date_trunc('month', now()) + interval '1 month - 1 day'))::integer;
BEGIN
  RETURN QUERY
  WITH category_monthly_spend AS (
    SELECT
      date_trunc('month', t.date)::date AS month_date,
      COALESCE(NULLIF(trim(t.category), ''), 'Lainnya') AS category,
      SUM(t.amount)::numeric AS total_spent
    FROM public.transactions t
    WHERE t.user_id = p_user_id
      AND t.type = 'expense'
      AND t.date >= (v_current_month - interval '3 months')
      AND t.date < (v_current_month + interval '1 month')
    GROUP BY 1, 2
  ),
  spikes AS (
    SELECT
      'spike'::text AS anomaly_type,
      cms.category,
      CASE
        WHEN cms.total_spent >= avg_prev.avg_spent * 2 THEN 'high'::text
        WHEN cms.total_spent >= avg_prev.avg_spent * 1.75 THEN 'medium'::text
        ELSE 'low'::text
      END AS severity,
      cms.total_spent AS current_value,
      avg_prev.avg_spent AS reference_value,
      format(
        'Pengeluaran %s bulan ini %.0f, sekitar %.0f%% dari rata-rata 3 bulan sebelumnya.',
        cms.category,
        cms.total_spent,
        CASE WHEN avg_prev.avg_spent > 0 THEN (cms.total_spent / avg_prev.avg_spent) * 100 ELSE 0 END
      ) AS description,
      jsonb_build_object(
        'ratio', CASE WHEN avg_prev.avg_spent > 0 THEN round((cms.total_spent / avg_prev.avg_spent)::numeric, 2) ELSE null END,
        'current_month', to_char(v_current_month, 'YYYY-MM'),
        'target_action', jsonb_build_object('type', 'highlight', 'target', 'widget-financial-pulse'),
        'suggested_next_step', format('Tinjau transaksi kategori %s dan bandingkan dengan bulan sebelumnya.', cms.category)
      ) AS metadata
    FROM category_monthly_spend cms
    JOIN (
      SELECT
        category,
        AVG(total_spent)::numeric AS avg_spent
      FROM category_monthly_spend
      WHERE month_date < v_current_month
      GROUP BY category
    ) avg_prev
      ON avg_prev.category = cms.category
    WHERE cms.month_date = v_current_month
      AND avg_prev.avg_spent > 0
      AND cms.total_spent > avg_prev.avg_spent * 1.5
  ),
  recurring_patterns AS (
    SELECT
      lower(COALESCE(NULLIF(trim(t.merchant), ''), NULLIF(trim(t.description), ''), COALESCE(NULLIF(trim(t.category), ''), 'pengeluaran rutin'))) AS recurring_key,
      max(COALESCE(NULLIF(trim(t.category), ''), 'Pengeluaran Rutin')) AS category,
      max(COALESCE(NULLIF(trim(t.merchant), ''), NULLIF(trim(t.description), ''), COALESCE(NULLIF(trim(t.category), ''), 'pengeluaran rutin'))) AS label,
      COUNT(DISTINCT date_trunc('month', t.date)::date) AS active_months,
      round(avg(EXTRACT(day FROM t.date)))::integer AS expected_day,
      avg(t.amount)::numeric AS expected_amount,
      max(t.amount)::numeric AS max_amount,
      min(t.amount)::numeric AS min_amount,
      max(t.date)::date AS last_seen_date
    FROM public.transactions t
    WHERE t.user_id = p_user_id
      AND t.type = 'expense'
      AND t.date >= (v_current_month - interval '3 months')
      AND t.date < v_current_month
    GROUP BY 1
  ),
  missing_recurring AS (
    SELECT
      'missing_recurring'::text AS anomaly_type,
      rp.category,
      CASE
        WHEN v_days_elapsed - rp.expected_day >= 14 THEN 'high'::text
        ELSE 'medium'::text
      END AS severity,
      0::numeric AS current_value,
      rp.expected_amount AS reference_value,
      format(
        'Pengeluaran rutin "%s" biasanya muncul sekitar tanggal %s, tetapi bulan ini belum terlihat.',
        rp.label,
        rp.expected_day
      ) AS description,
      jsonb_build_object(
        'expected_day', rp.expected_day,
        'last_seen_date', rp.last_seen_date,
        'recurring_label', rp.label,
        'target_action', jsonb_build_object('type', 'navigate', 'target', '/transactions'),
        'suggested_next_step', format('Cek apakah %s memang belum terbayar atau gagal tercatat.', rp.label)
      ) AS metadata
    FROM recurring_patterns rp
    WHERE rp.active_months = 3
      AND rp.max_amount <= GREATEST(rp.min_amount, 1) * 1.3
      AND v_days_elapsed > rp.expected_day + 5
      AND NOT EXISTS (
        SELECT 1
        FROM public.transactions t
        WHERE t.user_id = p_user_id
          AND t.type = 'expense'
          AND date_trunc('month', t.date)::date = v_current_month
          AND lower(COALESCE(NULLIF(trim(t.merchant), ''), NULLIF(trim(t.description), ''), COALESCE(NULLIF(trim(t.category), ''), 'pengeluaran rutin'))) = rp.recurring_key
          AND abs(EXTRACT(day FROM t.date)::integer - rp.expected_day) <= 5
      )
  ),
  budget_trajectory AS (
    SELECT
      'budget_trajectory'::text AS anomaly_type,
      COALESCE(NULLIF(trim(b.category), ''), b.name, 'Budget') AS category,
      CASE
        WHEN ((COALESCE(b.spent, 0) / v_days_elapsed) * v_days_in_month) >= COALESCE(b.amount, 0) * 1.2 THEN 'high'::text
        ELSE 'medium'::text
      END AS severity,
      round(((COALESCE(b.spent, 0) / v_days_elapsed) * v_days_in_month)::numeric, 2) AS current_value,
      COALESCE(b.amount, 0)::numeric AS reference_value,
      format(
        'Budget "%s" diproyeksikan mencapai %.0f sebelum akhir bulan jika laju belanja saat ini berlanjut.',
        COALESCE(b.name, 'Tanpa Nama'),
        ((COALESCE(b.spent, 0) / v_days_elapsed) * v_days_in_month)
      ) AS description,
      jsonb_build_object(
        'spent', COALESCE(b.spent, 0),
        'limit', COALESCE(b.amount, 0),
        'days_elapsed', v_days_elapsed,
        'days_in_month', v_days_in_month,
        'projected_total', round(((COALESCE(b.spent, 0) / v_days_elapsed) * v_days_in_month)::numeric, 2),
        'target_action', jsonb_build_object('type', 'highlight', 'target', 'widget-budget-status'),
        'suggested_next_step', format('Tinjau pengeluaran kategori %s dan pangkas belanja non-prioritas minggu ini.', COALESCE(NULLIF(trim(b.category), ''), b.name, 'ini'))
      ) AS metadata
    FROM public.budgets b
    WHERE b.user_id = p_user_id
      AND COALESCE(b.amount, 0) > 0
      AND ((COALESCE(b.spent, 0) / v_days_elapsed) * v_days_in_month) > COALESCE(b.amount, 0)
  )
  SELECT * FROM spikes
  UNION ALL
  SELECT * FROM missing_recurring
  UNION ALL
  SELECT * FROM budget_trajectory
  ORDER BY
    CASE severity
      WHEN 'high' THEN 1
      WHEN 'medium' THEN 2
      ELSE 3
    END,
    current_value DESC;
END;
$$;

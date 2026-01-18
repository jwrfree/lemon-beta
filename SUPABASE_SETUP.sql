-- 1. ENABLE ROW LEVEL SECURITY (RLS)
-- Pastikan semua tabel data user terisolasi
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Policy contoh untuk Wallets (Ulangi pola ini untuk tabel lain jika belum ada)
CREATE POLICY "Users can only see their own wallets" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallets" ON wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallets" ON wallets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wallets" ON wallets
  FOR DELETE USING (auth.uid() = user_id);

-- 2. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action VARCHAR(50) NOT NULL, -- e.g., 'LOGIN', 'CREATE_TRANSACTION'
  entity VARCHAR(50) NOT NULL, -- e.g., 'TRANSACTION', 'WALLET'
  entity_id VARCHAR(100),      -- ID dari item yang diubah
  details JSONB,               -- Data detail (metadata)
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS untuk Audit Logs (User hanya bisa lihat log mereka sendiri, tidak bisa edit/hapus)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. COMPLIANCE: DELETE ACCOUNT FUNCTION
-- Fungsi ini akan dipanggil via RPC untuk menghapus user secara bersih
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void AS $$
BEGIN
  -- Hapus data dari tabel-tabel terkait (Cascade biasanya menangani ini, tapi ini double safety)
  DELETE FROM transactions WHERE user_id = auth.uid();
  DELETE FROM wallets WHERE user_id = auth.uid();
  DELETE FROM budgets WHERE user_id = auth.uid();
  DELETE FROM debts WHERE user_id = auth.uid();
  DELETE FROM goals WHERE user_id = auth.uid();
  DELETE FROM audit_logs WHERE user_id = auth.uid();
  
  -- Hapus user dari auth.users (Memerlukan privilese admin, biasanya dilakukan via Service Role di server)
  -- Untuk Client-side, kita hanya membersihkan public tables.
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

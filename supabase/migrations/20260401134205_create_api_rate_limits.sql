-- Create a table for API rate limits
CREATE TABLE public.api_rate_limits (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    count INTEGER NOT NULL DEFAULT 1,
    reset_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (user_id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own rate limits
CREATE POLICY "Users can view own rate limits"
    ON public.api_rate_limits
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own rate limits"
    ON public.api_rate_limits
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rate limits"
    ON public.api_rate_limits
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create an RPC function to check and consume rate limits atomically
CREATE OR REPLACE FUNCTION public.consume_rate_limit(
    p_user_id UUID,
    p_max_requests INTEGER,
    p_window_ms BIGINT
)
RETURNS TABLE (allowed BOOLEAN, reset_at TIMESTAMPTZ) AS $$
DECLARE
    v_reset_at TIMESTAMPTZ;
    v_count INTEGER;
    v_now TIMESTAMPTZ := NOW();
    v_allowed BOOLEAN := FALSE;
BEGIN
    -- Select the existing rate limit for the user
    SELECT reset_at, count INTO v_reset_at, v_count
    FROM public.api_rate_limits
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        -- No rate limit exists, create one
        v_reset_at := v_now + (p_window_ms || ' milliseconds')::INTERVAL;
        INSERT INTO public.api_rate_limits (user_id, count, reset_at)
        VALUES (p_user_id, 1, v_reset_at);
        v_allowed := TRUE;
    ELSIF v_reset_at <= v_now THEN
        -- Rate limit expired, reset it
        v_reset_at := v_now + (p_window_ms || ' milliseconds')::INTERVAL;
        UPDATE public.api_rate_limits
        SET count = 1, reset_at = v_reset_at
        WHERE user_id = p_user_id;
        v_allowed := TRUE;
    ELSIF v_count < p_max_requests THEN
        -- Within limit, increment count
        UPDATE public.api_rate_limits
        SET count = count + 1
        WHERE user_id = p_user_id;
        v_allowed := TRUE;
    END IF;

    RETURN QUERY SELECT v_allowed, v_reset_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

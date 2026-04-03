CREATE TABLE IF NOT EXISTS public.chat_sessions (
    session_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    memory_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_updated_at
    ON public.chat_sessions(user_id, updated_at DESC);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'chat_sessions'
          AND policyname = 'Users can view their own chat sessions'
    ) THEN
        CREATE POLICY "Users can view their own chat sessions"
            ON public.chat_sessions
            FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'chat_sessions'
          AND policyname = 'Users can insert their own chat sessions'
    ) THEN
        CREATE POLICY "Users can insert their own chat sessions"
            ON public.chat_sessions
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'chat_sessions'
          AND policyname = 'Users can update their own chat sessions'
    ) THEN
        CREATE POLICY "Users can update their own chat sessions"
            ON public.chat_sessions
            FOR UPDATE
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'chat_sessions'
          AND policyname = 'Users can delete their own chat sessions'
    ) THEN
        CREATE POLICY "Users can delete their own chat sessions"
            ON public.chat_sessions
            FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;

DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON public.chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_updated_at_column();

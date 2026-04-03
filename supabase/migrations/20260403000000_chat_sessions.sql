-- Phase 3: Durable Conversation Memory
-- Creates chat_sessions table for persisting Lemon Coach conversation history.

create table if not exists chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  messages jsonb not null default '[]',
  memory_summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_chat_sessions_user_updated
  on chat_sessions (user_id, updated_at desc);

alter table chat_sessions enable row level security;

create policy "Users own their sessions"
  on chat_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Supabase schema for city-love

create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  sender_name text not null,
  receiver_name text not null,
  message text not null,
  sender_province text not null,
  receiver_province text not null,
  theme text default 'romantic',
  heart_color text default '#ff2d55',
  hearts_count int default 0,
  created_at timestamptz default now()
);

-- Index for fast slug lookup
create index if not exists idx_messages_slug on messages(slug);

-- Row Level Security
alter table messages enable row level security;

-- Anyone can read messages (they have the link)
create policy "Anyone can read messages" on messages
  for select using (true);

-- Anyone can insert messages (with rate limiting at app level)
create policy "Anyone can insert messages" on messages
  for insert with check (true);

-- Allow incrementing hearts
create policy "Anyone can update heart count" on messages
  for update using (true)
  with check (true);

-- ==========================================================
-- নিজের হিসাব — Supabase schema
-- Supabase Dashboard → SQL Editor -এ পুরো ফাইলটা paste করে Run করো
-- ==========================================================

-- 1) priorities (প্রায়োরিটি/হ্যাবিট)
create table if not exists public.priorities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null default 'অন্যান্য',
  planned_minutes int not null default 0,
  time text default '',
  completed_dates jsonb not null default '{}'::jsonb,
  streak int not null default 0,
  created_at timestamptz not null default now()
);

-- 2) expenses (খরচ)
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null,
  category text not null default 'অন্যান্য',
  note text default '',
  date date not null,
  receipt text,
  created_at timestamptz not null default now()
);

-- 3) debts (ধার-দেনা)
create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric not null,
  type text not null check (type in ('owe', 'owed')),
  note text default '',
  date date not null,
  settled boolean not null default false,
  settled_date date,
  created_at timestamptz not null default now()
);

-- ---------- Row Level Security ----------
alter table public.priorities enable row level security;
alter table public.expenses enable row level security;
alter table public.debts enable row level security;

create policy "priorities_select_own" on public.priorities for select using (auth.uid() = user_id);
create policy "priorities_insert_own" on public.priorities for insert with check (auth.uid() = user_id);
create policy "priorities_update_own" on public.priorities for update using (auth.uid() = user_id);
create policy "priorities_delete_own" on public.priorities for delete using (auth.uid() = user_id);

create policy "expenses_select_own" on public.expenses for select using (auth.uid() = user_id);
create policy "expenses_insert_own" on public.expenses for insert with check (auth.uid() = user_id);
create policy "expenses_update_own" on public.expenses for update using (auth.uid() = user_id);
create policy "expenses_delete_own" on public.expenses for delete using (auth.uid() = user_id);

create policy "debts_select_own" on public.debts for select using (auth.uid() = user_id);
create policy "debts_insert_own" on public.debts for insert with check (auth.uid() = user_id);
create policy "debts_update_own" on public.debts for update using (auth.uid() = user_id);
create policy "debts_delete_own" on public.debts for delete using (auth.uid() = user_id);

-- ---------- Realtime ----------
-- Supabase Dashboard → Database → Replication -এ গিয়ে
-- priorities, expenses, debts টেবিল তিনটার জন্য Realtime চালু করে দাও।
-- (অথবা নিচের কমান্ড চালাতে পারো, যদি supabase_realtime publication আগে থেকেই থাকে)
alter publication supabase_realtime add table public.priorities;
alter publication supabase_realtime add table public.expenses;
alter publication supabase_realtime add table public.debts;

-- ---------- Storage (রসিদের ছবি) ----------
-- Dashboard → Storage থেকে ম্যানুয়ালিও করা যায়:
-- 1. নতুন bucket তৈরি করো নাম দিয়ে: receipts
-- 2. bucket-টা "Public" করে দাও (public URL দিয়ে ছবি দেখানোর জন্য)
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', true)
on conflict (id) do nothing;

create policy "receipts_own_folder_select" on storage.objects
  for select using (bucket_id = 'receipts');

create policy "receipts_own_folder_insert" on storage.objects
  for insert with check (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "receipts_own_folder_update" on storage.objects
  for update using (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "receipts_own_folder_delete" on storage.objects
  for delete using (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);

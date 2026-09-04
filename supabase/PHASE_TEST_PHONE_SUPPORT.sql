-- Promo's World: phone uniqueness + customer service
alter table public.profiles add column if not exists telephone text;
-- Store phone in auth metadata as well; profiles remains the canonical marketplace identity record.
update public.profiles set telephone = null where telephone = '';
alter table public.profiles drop constraint if exists profiles_telephone_unique;
create unique index if not exists profiles_telephone_unique_idx on public.profiles (telephone) where telephone is not null;
create table if not exists public.customer_service_config (
  id boolean primary key default true check (id),
  user_id uuid not null references public.profiles(id) on delete cascade,
  updated_at timestamptz not null default now()
);
alter table public.customer_service_config enable row level security;
drop policy if exists "Authenticated users can read support config" on public.customer_service_config;
create policy "Authenticated users can read support config" on public.customer_service_config for select to authenticated using (true);
drop policy if exists "Admins manage support config" on public.customer_service_config;
create policy "Admins manage support config" on public.customer_service_config for all to authenticated using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
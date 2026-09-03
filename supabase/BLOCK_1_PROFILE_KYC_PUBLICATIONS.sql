-- PROMO'S WORLD — BLOCK 1 DATABASE UPGRADE
-- Execute this entire script in Supabase SQL Editor.

alter table public.profiles
  add column if not exists pays text,
  add column if not exists ville text,
  add column if not exists kyc_status text not null default 'non_soumis',
  add column if not exists kyc_rejection_reason text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.promotions
  add column if not exists type text not null default 'promotion';

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('client','vendeur','admin'));

alter table public.profiles drop constraint if exists profiles_kyc_status_check;
alter table public.profiles add constraint profiles_kyc_status_check check (kyc_status in ('non_soumis','en_attente','verifie','rejete'));

alter table public.promotions drop constraint if exists promotions_type_check;
alter table public.promotions add constraint promotions_type_check check (type in ('article','promotion'));

create table if not exists public.kyc_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  document_type text not null,
  document_number text,
  document_front_url text,
  document_back_url text,
  selfie_video_url text,
  business_name text,
  business_type text,
  business_address text,
  status text not null default 'en_attente' check (status in ('en_attente','verifie','rejete')),
  rejection_reason text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_location on public.profiles(pays, ville);
create index if not exists idx_promotions_location on public.promotions(pays, ville);
create index if not exists idx_promotions_type_status on public.promotions(type, statut);
create index if not exists idx_kyc_user_status on public.kyc_submissions(user_id, status);

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists kyc_submissions_set_updated_at on public.kyc_submissions;
create trigger kyc_submissions_set_updated_at before update on public.kyc_submissions
for each row execute function public.set_updated_at();

alter table public.kyc_submissions enable row level security;

drop policy if exists "Users can view own KYC" on public.kyc_submissions;
create policy "Users can view own KYC" on public.kyc_submissions
for select using (auth.uid() = user_id or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));

drop policy if exists "Users can create own KYC" on public.kyc_submissions;
create policy "Users can create own KYC" on public.kyc_submissions
for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own pending KYC" on public.kyc_submissions;
create policy "Users can update own pending KYC" on public.kyc_submissions
for update using (auth.uid() = user_id and status='en_attente');

-- Keep profile location aligned with new registrations.
-- If a profile already exists, the application upsert updates it.

-- Seller publication protection:
-- Vendors must be KYC verified before inserting a publication.
drop policy if exists "Verified sellers can create publications" on public.promotions;
create policy "Verified sellers can create publications" on public.promotions
for insert with check (
  auth.uid() = vendeur_id
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'vendeur'
      and p.kyc_status = 'verifie'
  )
);

-- Public marketplace reads active publications.
drop policy if exists "Anyone can view active publications" on public.promotions;
create policy "Anyone can view active publications" on public.promotions
for select using (statut = 'actif' or vendeur_id = auth.uid() or exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));

-- IMPORTANT:
-- Admin approval/rejection should be performed through a secure server-side/admin workflow
-- once the Admin KYC page is added.

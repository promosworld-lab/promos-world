-- Reproducible migration for publication lifecycle, categories and media.
-- Applied to the connected test project.
create table if not exists public.categories (id uuid primary key default gen_random_uuid(),nom text not null unique,actif boolean not null default true,ordre integer not null default 0);
insert into public.categories(nom,ordre) values ('Mode & accessoires',1),('Beauté & soins',2),('Maison & décoration',3),('Électronique & informatique',4),('Téléphones & accessoires',5),('Électroménager',6),('Meubles',7),('Alimentation & boissons',8),('Santé & bien-être',9),('Sport & loisirs',10),('Automobile & moto',11),('Bébés & enfants',12),('Livres & éducation',13),('Services professionnels',14),('Services à domicile',15),('Immobilier',16),('Agriculture & élevage',17),('Artisanat & créations',18),('Animaux',19),('Emploi & formation',20),('Voyage & tourisme',21),('Autres',99) on conflict(nom) do nothing;
alter table public.categories enable row level security;
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select to anon,authenticated using(actif=true);
alter table public.promotions add column if not exists date_debut_promo timestamptz;
alter table public.promotions add column if not exists date_fin_promo timestamptz;
create table if not exists public.promotion_media(id uuid primary key default gen_random_uuid(),promotion_id uuid not null references public.promotions(id) on delete cascade,vendeur_id uuid not null references public.profiles(id) on delete cascade,storage_path text not null,media_type text not null check(media_type in ('image','video')),position integer not null default 0,created_at timestamptz not null default now());
alter table public.promotion_media enable row level security;
drop policy if exists promotion_media_public_read on public.promotion_media;
create policy promotion_media_public_read on public.promotion_media for select to anon,authenticated using(exists(select 1 from public.promotions p where p.id=promotion_id and p.is_active=true));
drop policy if exists promotion_media_owner_manage on public.promotion_media;
create policy promotion_media_owner_manage on public.promotion_media for all to authenticated using(vendeur_id=auth.uid() or public.is_admin()) with check(vendeur_id=auth.uid() or public.is_admin());
create index if not exists idx_promotion_media_promotion on public.promotion_media(promotion_id,position);
insert into storage.buckets(id,name,public) values('publication-media','publication-media',true) on conflict(id) do update set public=true;
create or replace function public.stop_publication(p_promotion_id uuid) returns void language plpgsql security invoker set search_path to public as $$ begin update public.promotions set is_active=false,updated_at=now() where id=p_promotion_id and vendeur_id=auth.uid(); if not found then raise exception 'publication_introuvable_ou_non_autorisee'; end if; end; $$;
revoke all on function public.stop_publication(uuid) from public;grant execute on function public.stop_publication(uuid) to authenticated;
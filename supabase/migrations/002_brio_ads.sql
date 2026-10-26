-- BRIO Brasil — módulo comercial de publicidade
create table if not exists public.ads (
  id uuid primary key default gen_random_uuid(),
  advertiser text not null,
  campaign text not null,
  placement text not null check (placement in ('top','home_feature','home_feed','article_middle','article_end')),
  image_url text not null,
  mobile_image_url text,
  target_url text,
  alt_text text,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  active boolean not null default true,
  impressions bigint not null default 0,
  clicks bigint not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ads_active_placement_idx on public.ads(active,placement,starts_at,ends_at);

drop trigger if exists ads_touch_updated_at on public.ads;
create trigger ads_touch_updated_at before update on public.ads for each row execute function public.touch_updated_at();

alter table public.ads enable row level security;
create policy "Public read active ads" on public.ads for select using (active=true and starts_at<=now() and (ends_at is null or ends_at>=now()) or public.is_staff());
create policy "Editors insert ads" on public.ads for insert with check (public.is_editor());
create policy "Editors update ads" on public.ads for update using (public.is_editor()) with check (public.is_editor());
create policy "Editors delete ads" on public.ads for delete using (public.is_editor());

-- Imagens dos anúncios usam o bucket público brio-media já existente.

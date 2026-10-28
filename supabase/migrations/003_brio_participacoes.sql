-- BRIO Brasil — participações da comunidade
create table if not exists public.participations (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('pauta','denuncia','opiniao')),
  status text not null default 'novo' check (status in ('novo','em_analise','em_apuracao','aprovado','arquivado')),
  name text,
  contact text,
  city text,
  subject text not null,
  message text not null,
  anonymous boolean not null default false,
  attachments jsonb not null default '[]'::jsonb,
  source text not null default 'home',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists participations_status_created_idx on public.participations(status,created_at desc);
create index if not exists participations_type_created_idx on public.participations(type,created_at desc);

drop trigger if exists participations_touch_updated_at on public.participations;
create trigger participations_touch_updated_at before update on public.participations for each row execute function public.touch_updated_at();

alter table public.participations enable row level security;

drop policy if exists "Public submit participations" on public.participations;
create policy "Public submit participations" on public.participations
for insert to anon, authenticated
with check (
  status='novo'
  and type in ('pauta','denuncia','opiniao')
  and char_length(subject) between 3 and 180
  and char_length(message) between 10 and 8000
);

drop policy if exists "Staff read participations" on public.participations;
create policy "Staff read participations" on public.participations
for select to authenticated using (public.is_staff());

drop policy if exists "Staff update participations" on public.participations;
create policy "Staff update participations" on public.participations
for update to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "Editors delete participations" on public.participations;
create policy "Editors delete participations" on public.participations
for delete to authenticated using (public.is_editor());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values(
  'brio-participacoes',
  'brio-participacoes',
  false,
  8388608,
  array['image/jpeg','image/png','image/webp','application/pdf','video/mp4']
)
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "Public upload participation files" on storage.objects;
create policy "Public upload participation files" on storage.objects
for insert to anon, authenticated
with check (bucket_id='brio-participacoes' and (auth.role()='anon' or public.is_staff()));

drop policy if exists "Staff read participation files" on storage.objects;
create policy "Staff read participation files" on storage.objects
for select to authenticated using (bucket_id='brio-participacoes' and public.is_staff());

drop policy if exists "Staff delete participation files" on storage.objects;
create policy "Staff delete participation files" on storage.objects
for delete to authenticated using (bucket_id='brio-participacoes' and public.is_staff());

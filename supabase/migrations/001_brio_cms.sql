-- BRIO Brasil CMS — schema inicial
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '', avatar_url text,
  role text not null default 'redator' check (role in ('admin','editor','redator')),
  active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique,
  description text, sort_order int not null default 0, active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique,
  excerpt text, content text not null default '', cover_url text, cover_alt text,
  category_id uuid references public.categories(id) on delete set null,
  author_id uuid references public.profiles(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','scheduled','published','archived')),
  featured boolean not null default false, breaking boolean not null default false, opinion boolean not null default false,
  tags text[] not null default '{}', seo_title text, seo_description text,
  published_at timestamptz, scheduled_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists posts_status_published_idx on public.posts(status,published_at desc);
create index if not exists posts_category_idx on public.posts(category_id);
create index if not exists posts_featured_idx on public.posts(featured) where featured=true;

insert into public.categories(name,slug,sort_order) values
 ('Brasil','brasil',1),('Política','politica',2),('Economia','economia',3),('Segurança','seguranca',4),('Mundo','mundo',5),('Sociedade','sociedade',6),('Opinião','opiniao',7)
on conflict (slug) do update set name=excluded.name,sort_order=excluded.sort_order;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at before update on public.profiles for each row execute function public.touch_updated_at();
drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at before update on public.posts for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id,name) values(new.id,coalesce(new.raw_user_meta_data->>'name',split_part(coalesce(new.email,''),'@',1))) on conflict(id) do nothing; return new; end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.posts enable row level security;

create or replace function public.is_staff() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and active=true and role in ('admin','editor','redator')); $$;
create or replace function public.is_editor() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and active=true and role in ('admin','editor')); $$;

create policy "Public read categories" on public.categories for select using (active=true or public.is_staff());
create policy "Editors manage categories" on public.categories for all using (public.is_editor()) with check (public.is_editor());
create policy "Public read published posts" on public.posts for select using ((status='published' and published_at<=now()) or public.is_staff());
create policy "Staff insert posts" on public.posts for insert with check (public.is_staff() and (author_id=auth.uid() or public.is_editor()));
create policy "Staff update posts" on public.posts for update using (public.is_editor() or author_id=auth.uid()) with check (public.is_editor() or author_id=auth.uid());
create policy "Editors delete posts" on public.posts for delete using (public.is_editor());
create policy "Own profile or editors read profiles" on public.profiles for select using (id=auth.uid() or public.is_editor());
create policy "Own profile update" on public.profiles for update using (id=auth.uid()) with check (id=auth.uid());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('brio-media','brio-media',true,10485760,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict(id) do update set public=true;
create policy "Public read BRIO media" on storage.objects for select using (bucket_id='brio-media');
create policy "Staff upload BRIO media" on storage.objects for insert with check (bucket_id='brio-media' and public.is_staff());
create policy "Staff update BRIO media" on storage.objects for update using (bucket_id='brio-media' and public.is_staff()) with check (bucket_id='brio-media' and public.is_staff());
create policy "Editors delete BRIO media" on storage.objects for delete using (bucket_id='brio-media' and public.is_editor());

-- Depois de criar o primeiro usuário em Authentication > Users, promova-o:
-- update public.profiles set role='admin' where id='UUID_DO_USUARIO';

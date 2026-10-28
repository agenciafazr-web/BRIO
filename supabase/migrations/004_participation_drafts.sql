-- BRIO Brasil — vínculo entre participações e matérias

alter table public.posts
  add column if not exists participation_id uuid references public.participations(id) on delete set null;

alter table public.participations
  add column if not exists generated_post_id uuid references public.posts(id) on delete set null;

create unique index if not exists posts_participation_unique_idx
  on public.posts(participation_id)
  where participation_id is not null;

create index if not exists participations_generated_post_idx
  on public.participations(generated_post_id)
  where generated_post_id is not null;

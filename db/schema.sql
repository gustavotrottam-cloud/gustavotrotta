-- ============================================================================
-- Schema: Área Exclusiva Clientes — Gustavo Trotta
-- ----------------------------------------------------------------------------
-- Cole este arquivo inteiro no SQL Editor do Supabase (Database → SQL Editor)
-- e clique em "Run". Cria todas as tabelas, políticas RLS, triggers e seeds.
-- ============================================================================

-- ─── Tipos enumerados ──────────────────────────────────────────────────────
do $$ begin
  create type user_role as enum ('client', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type content_kind as enum ('article', 'video', 'audio', 'pdf', 'report');
exception when duplicate_object then null; end $$;

do $$ begin
  create type content_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_kind as enum ('live', 'meeting', 'call', 'webinar', 'in_person');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_status as enum ('scheduled', 'live', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

-- ─── Profiles ──────────────────────────────────────────────────────────────
-- Estende `auth.users` com informações de perfil.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role user_role not null default 'client',
  invited_by uuid references auth.users(id),
  accepted_at timestamptz,
  last_login_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update to authenticated
  using (
    id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Auto-cria profile quando novo usuário é criado via Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Categorias ────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  parent_id uuid references public.categories(id),
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

drop policy if exists "categories_read_all_authenticated" on public.categories;
create policy "categories_read_all_authenticated" on public.categories
  for select to authenticated using (true);

-- Seed das categorias iniciais (idempotente)
insert into public.categories (slug, name, display_order) values
  ('juros', 'Juros', 10),
  ('inflacao', 'Inflação', 20),
  ('brasil', 'Brasil', 30),
  ('eua', 'EUA', 40),
  ('renda-fixa', 'Renda Fixa', 50),
  ('acoes', 'Ações', 60),
  ('fundos-imobiliarios', 'Fundos Imobiliários', 70),
  ('cambio', 'Câmbio', 80),
  ('previdencia', 'Previdência', 90),
  ('sucessao', 'Sucessão', 100),
  ('tributacao', 'Tributação', 110),
  ('aposentadoria', 'Aposentadoria', 120),
  ('planejamento-patrimonial', 'Planejamento Patrimonial', 130)
on conflict (slug) do nothing;

-- ─── Conteúdo (artigos, vídeos, PDFs, research) ────────────────────────────
create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body text,
  kind content_kind not null,
  status content_status not null default 'draft',

  -- Research-specific structured fields
  executive_summary text,
  key_insights text[],
  why_it_matters text,

  -- Media URLs
  thumbnail_url text,
  video_url text,
  audio_url text,
  file_url text,

  -- Categorização
  category_id uuid references public.categories(id),
  tags text[],

  -- Publicação
  published_at timestamptz,
  author text default 'Gustavo Trotta',
  reading_time_min int,

  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_items enable row level security;

drop policy if exists "content_published_for_clients" on public.content_items;
create policy "content_published_for_clients" on public.content_items
  for select to authenticated
  using (
    status = 'published'
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "content_admin_write" on public.content_items;
create policy "content_admin_write" on public.content_items
  for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create index if not exists content_items_status_published_at_idx
  on public.content_items (status, published_at desc);

create index if not exists content_items_category_idx
  on public.content_items (category_id);

-- ─── Eventos ───────────────────────────────────────────────────────────────
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  kind event_kind not null,
  status event_status not null default 'scheduled',
  starts_at timestamptz not null,
  duration_min int,
  location text,
  meeting_url text,
  recording_url text,
  materials_url text,
  capacity int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.events enable row level security;

drop policy if exists "events_read_authenticated" on public.events;
create policy "events_read_authenticated" on public.events
  for select to authenticated using (true);

drop policy if exists "events_admin_write" on public.events;
create policy "events_admin_write" on public.events
  for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ─── RSVPs ─────────────────────────────────────────────────────────────────
create table if not exists public.event_rsvps (
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  rsvp_at timestamptz not null default now(),
  attended boolean,
  primary key (event_id, profile_id)
);

alter table public.event_rsvps enable row level security;

drop policy if exists "rsvps_own" on public.event_rsvps;
create policy "rsvps_own" on public.event_rsvps
  for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- ─── Itens salvos / favoritos ──────────────────────────────────────────────
create table if not exists public.saved_items (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  content_id uuid not null references public.content_items(id) on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (profile_id, content_id)
);

alter table public.saved_items enable row level security;

drop policy if exists "saved_own" on public.saved_items;
create policy "saved_own" on public.saved_items
  for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- ─── Analytics de visualização ─────────────────────────────────────────────
create table if not exists public.content_views (
  id bigint generated by default as identity primary key,
  profile_id uuid references public.profiles(id) on delete set null,
  content_id uuid not null references public.content_items(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  duration_sec int
);

alter table public.content_views enable row level security;

drop policy if exists "views_insert_own" on public.content_views;
create policy "views_insert_own" on public.content_views
  for insert to authenticated
  with check (profile_id = auth.uid() or profile_id is null);

drop policy if exists "views_admin_select" on public.content_views;
create policy "views_admin_select" on public.content_views
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create index if not exists content_views_content_viewed_at_idx
  on public.content_views (content_id, viewed_at desc);

create index if not exists content_views_profile_viewed_at_idx
  on public.content_views (profile_id, viewed_at desc);

-- ─── Helper: promover usuário a admin ──────────────────────────────────────
-- Use uma vez, após sua primeira conta ser criada:
--   select public.promote_to_admin('gustavo.mendonca@valorinvestimentos.com.br');
create or replace function public.promote_to_admin(user_email text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = user_email;
  if v_user_id is null then
    raise exception 'Usuário % não encontrado em auth.users', user_email;
  end if;
  update public.profiles set role = 'admin' where id = v_user_id;
end;
$$;

-- ============================================================
-- BAIKAL Core Platform — Database Schema v1.0
-- Supabase PostgreSQL
--
-- 실행 순서: 이 파일을 Supabase SQL Editor에서 순서대로 실행
-- 또는: supabase db push 사용
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";   -- 전문 검색용


-- ============================================================
-- 1. organizations
-- ============================================================
create table if not exists organizations (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  created_at  timestamptz not null default now()
);

comment on table organizations is '플랫폼에 등록된 조직(회사/개인)';


-- ============================================================
-- 2. sites
-- ============================================================
create type site_status as enum ('active', 'inactive', 'maintenance');
create type site_type   as enum (
  'corporate', 'hospital', 'commerce',
  'expert', 'portfolio', 'content'
);

create table if not exists sites (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  slug            text not null unique,
  domain          text unique,
  name            text not null,
  type            site_type not null,
  status          site_status not null default 'active',
  template_id     text not null,          -- templateRegistry key (e.g. 'corporate')
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table sites is '플랫폼에서 운영하는 개별 사이트';
comment on column sites.template_id is 'templateRegistry에 등록된 템플릿 ID';

create index idx_sites_slug   on sites(slug);
create index idx_sites_domain on sites(domain) where domain is not null;
create index idx_sites_status on sites(status);


-- ============================================================
-- 3. site_settings
-- ============================================================
create table if not exists site_settings (
  id           uuid primary key default uuid_generate_v4(),
  site_id      uuid not null unique references sites(id) on delete cascade,
  locale       text not null default 'ko',
  timezone     text not null default 'Asia/Seoul',
  modules      text[] not null default '{}',    -- 활성화된 모듈 ID 목록
  meta         jsonb not null default '{}',      -- SiteMetaConfig
  feature_flags jsonb not null default '{}',     -- SiteFeatureFlags
  updated_at   timestamptz not null default now()
);

comment on table site_settings is '사이트별 메타/기능 설정';
comment on column site_settings.modules      is '활성화된 moduleRegistry ID 목록 (e.g. ["blog","contact"])';
comment on column site_settings.meta         is '{ title, description, keywords, ogImage, favicon }';
comment on column site_settings.feature_flags is '{ blog, portfolio, contact, booking, ecommerce, mediaHub }';


-- ============================================================
-- 4. tags & topics  (콘텐츠 분류 마스터)
-- ============================================================
create table if not exists tags (
  id      uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id) on delete cascade,
  name    text not null,
  slug    text not null,
  unique (site_id, slug)
);
create index idx_tags_site on tags(site_id);

create table if not exists topics (
  id          uuid primary key default uuid_generate_v4(),
  site_id     uuid not null references sites(id) on delete cascade,
  name        text not null,
  slug        text not null,
  description text,
  unique (site_id, slug)
);
create index idx_topics_site on topics(site_id);


-- ============================================================
-- 5. contents
-- ============================================================
create type content_type   as enum ('page', 'post', 'project', 'product', 'custom');
create type content_status as enum ('draft', 'published', 'archived');

create table if not exists contents (
  id           uuid primary key default uuid_generate_v4(),
  site_id      uuid not null references sites(id) on delete cascade,
  type         content_type not null,
  slug         text not null,
  title        text not null,
  body         text,                              -- JSON (rich) 또는 Markdown
  status       content_status not null default 'draft',
  author_id    uuid not null,                     -- auth.users.id
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  meta         jsonb not null default '{}',       -- ContentMeta
  unique (site_id, slug)
);

comment on table contents is '모든 콘텐츠 (페이지/포스트/프로젝트/상품)';
comment on column contents.body is 'JSON 직렬화된 rich content 또는 Markdown 문자열';
comment on column contents.meta is '{ title, description, ogImage, tags[], topics[] }';

create index idx_contents_site_type   on contents(site_id, type);
create index idx_contents_site_status on contents(site_id, status);
create index idx_contents_published   on contents(published_at desc) where status = 'published';
-- 제목 전문 검색
create index idx_contents_title_trgm  on contents using gin(title gin_trgm_ops);


-- ============================================================
-- 6. content_tags / content_topics  (다대다 관계)
-- ============================================================
create table if not exists content_tags (
  content_id uuid not null references contents(id) on delete cascade,
  tag_id     uuid not null references tags(id) on delete cascade,
  primary key (content_id, tag_id)
);

create table if not exists content_topics (
  content_id uuid not null references contents(id) on delete cascade,
  topic_id   uuid not null references topics(id) on delete cascade,
  primary key (content_id, topic_id)
);


-- ============================================================
-- 7. projects  (Portfolio 모듈 전용 확장 테이블)
-- ============================================================
create table if not exists projects (
  id          uuid primary key default uuid_generate_v4(),
  content_id  uuid not null unique references contents(id) on delete cascade,
  site_id     uuid not null references sites(id) on delete cascade,
  client      text,
  url         text,
  stack       text[],              -- 기술 스택 배열
  featured    boolean not null default false,
  order_index integer not null default 0
);

create index idx_projects_site     on projects(site_id);
create index idx_projects_featured on projects(site_id, featured) where featured = true;


-- ============================================================
-- 8. media_assets
-- ============================================================
create type media_type as enum ('image', 'video', 'document', 'audio');

create table if not exists media_assets (
  id             uuid primary key default uuid_generate_v4(),
  site_id        uuid not null references sites(id) on delete cascade,
  name           text not null,
  url            text not null,
  storage_path   text not null unique,
  mime_type      text not null,
  type           media_type not null,
  size           bigint not null,              -- bytes
  width          integer,
  height         integer,
  alt            text,
  uploaded_by_id uuid not null,               -- auth.users.id
  created_at     timestamptz not null default now()
);

create index idx_media_site      on media_assets(site_id);
create index idx_media_type      on media_assets(site_id, type);
create index idx_media_created   on media_assets(created_at desc);


-- ============================================================
-- 9. site_members  (사이트별 역할 관리)
-- ============================================================
create type user_role as enum ('platform_admin', 'site_admin', 'editor', 'viewer');

create table if not exists site_members (
  id         uuid primary key default uuid_generate_v4(),
  site_id    uuid not null references sites(id) on delete cascade,
  user_id    uuid not null,                   -- auth.users.id
  role       user_role not null default 'viewer',
  created_at timestamptz not null default now(),
  unique (site_id, user_id)
);

create index idx_site_members_user on site_members(user_id);
create index idx_site_members_site on site_members(site_id);


-- ============================================================
-- 10. forms
-- ============================================================
create table if not exists forms (
  id          uuid primary key default uuid_generate_v4(),
  site_id     uuid not null references sites(id) on delete cascade,
  name        text not null,
  slug        text not null,
  schema      jsonb not null default '[]',    -- 폼 필드 정의 배열
  email_to    text[],                         -- 수신 이메일 목록
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (site_id, slug)
);

create index idx_forms_site on forms(site_id);


-- ============================================================
-- 11. form_submissions
-- ============================================================
create table if not exists form_submissions (
  id          uuid primary key default uuid_generate_v4(),
  form_id     uuid not null references forms(id) on delete cascade,
  site_id     uuid not null references sites(id) on delete cascade,
  data        jsonb not null default '{}',    -- 제출 데이터
  ip          text,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index idx_submissions_form    on form_submissions(form_id);
create index idx_submissions_site    on form_submissions(site_id);
create index idx_submissions_created on form_submissions(created_at desc);


-- ============================================================
-- Triggers: updated_at 자동 갱신
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_sites_updated_at
  before update on sites
  for each row execute function set_updated_at();

create trigger trg_site_settings_updated_at
  before update on site_settings
  for each row execute function set_updated_at();

create trigger trg_contents_updated_at
  before update on contents
  for each row execute function set_updated_at();

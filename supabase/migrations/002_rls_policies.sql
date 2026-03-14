-- ============================================================
-- BAIKAL Core Platform — Row Level Security (RLS) v1.0
-- Supabase RLS 정책
--
-- 원칙:
--   - 모든 테이블 RLS 활성화
--   - anon(비로그인)은 published 콘텐츠만 읽기 가능
--   - authenticated는 자신의 site_id 데이터만 접근
--   - platform_admin은 모든 데이터 접근 (service_role로 처리)
-- ============================================================


-- ============================================================
-- sites — RLS
-- ============================================================
alter table sites enable row level security;

-- 비로그인: active 사이트는 읽기 가능 (Site Resolver용)
drop policy if exists "sites_select_active" on sites;
create policy "sites_select_active"
  on sites for select
  using (status = 'active');

-- 인증 사용자: 자신이 멤버인 사이트 전체 접근
drop policy if exists "sites_select_own" on sites;
create policy "sites_select_own"
  on sites for select
  to authenticated
  using (
    id in (
      select site_id from site_members
      where user_id = auth.uid()
    )
  );


-- ============================================================
-- site_settings — RLS
-- ============================================================
alter table site_settings enable row level security;

-- 비로그인: active 사이트의 설정 읽기 가능
drop policy if exists "site_settings_select_active" on site_settings;
create policy "site_settings_select_active"
  on site_settings for select
  using (
    site_id in (select id from sites where status = 'active')
  );

-- site_admin 이상: 수정 가능
drop policy if exists "site_settings_update_admin" on site_settings;
create policy "site_settings_update_admin"
  on site_settings for update
  to authenticated
  using (
    site_id in (
      select site_id from site_members
      where user_id = auth.uid()
        and role in ('site_admin', 'platform_admin')
    )
  );


-- ============================================================
-- contents — RLS
-- ============================================================
alter table contents enable row level security;

-- 비로그인: published 콘텐츠만 읽기
drop policy if exists "contents_select_published" on contents;
create policy "contents_select_published"
  on contents for select
  using (status = 'published');

-- 인증 사용자: 자신의 사이트 모든 상태 읽기
drop policy if exists "contents_select_member" on contents;
create policy "contents_select_member"
  on contents for select
  to authenticated
  using (
    site_id in (
      select site_id from site_members
      where user_id = auth.uid()
    )
  );

-- editor 이상: 삽입/수정
drop policy if exists "contents_insert_editor" on contents;
create policy "contents_insert_editor"
  on contents for insert
  to authenticated
  with check (
    site_id in (
      select site_id from site_members
      where user_id = auth.uid()
        and role in ('editor', 'site_admin', 'platform_admin')
    )
  );

drop policy if exists "contents_update_editor" on contents;
create policy "contents_update_editor"
  on contents for update
  to authenticated
  using (
    site_id in (
      select site_id from site_members
      where user_id = auth.uid()
        and role in ('editor', 'site_admin', 'platform_admin')
    )
  );

-- site_admin 이상: 삭제
drop policy if exists "contents_delete_admin" on contents;
create policy "contents_delete_admin"
  on contents for delete
  to authenticated
  using (
    site_id in (
      select site_id from site_members
      where user_id = auth.uid()
        and role in ('site_admin', 'platform_admin')
    )
  );


-- ============================================================
-- media_assets — RLS
-- ============================================================
alter table media_assets enable row level security;

-- 비로그인: 읽기 가능 (공개 미디어)
drop policy if exists "media_select_public" on media_assets;
create policy "media_select_public"
  on media_assets for select
  using (true);

-- editor 이상: 업로드(삽입)/삭제
drop policy if exists "media_insert_editor" on media_assets;
create policy "media_insert_editor"
  on media_assets for insert
  to authenticated
  with check (
    site_id in (
      select site_id from site_members
      where user_id = auth.uid()
        and role in ('editor', 'site_admin', 'platform_admin')
    )
  );

drop policy if exists "media_delete_admin" on media_assets;
create policy "media_delete_admin"
  on media_assets for delete
  to authenticated
  using (
    uploaded_by_id = auth.uid()
    or site_id in (
      select site_id from site_members
      where user_id = auth.uid()
        and role in ('site_admin', 'platform_admin')
    )
  );


-- ============================================================
-- forms — RLS
-- ============================================================
alter table forms enable row level security;

-- 비로그인: active 폼 읽기 가능 (contact form 렌더링)
drop policy if exists "forms_select_active" on forms;
create policy "forms_select_active"
  on forms for select
  using (active = true);

-- site_admin 이상: 관리
drop policy if exists "forms_manage_admin" on forms;
create policy "forms_manage_admin"
  on forms for all
  to authenticated
  using (
    site_id in (
      select site_id from site_members
      where user_id = auth.uid()
        and role in ('site_admin', 'platform_admin')
    )
  );


-- ============================================================
-- form_submissions — RLS
-- ============================================================
alter table form_submissions enable row level security;

-- 비로그인: 삽입만 가능 (폼 제출)
drop policy if exists "submissions_insert_anon" on form_submissions;
create policy "submissions_insert_anon"
  on form_submissions for insert
  with check (true);

-- site_admin 이상: 제출 데이터 읽기
drop policy if exists "submissions_select_admin" on form_submissions;
create policy "submissions_select_admin"
  on form_submissions for select
  to authenticated
  using (
    site_id in (
      select site_id from site_members
      where user_id = auth.uid()
        and role in ('site_admin', 'platform_admin')
    )
  );


-- ============================================================
-- tags / topics / content_tags / content_topics — RLS
-- ============================================================
alter table tags enable row level security;
alter table topics enable row level security;
alter table content_tags enable row level security;
alter table content_topics enable row level security;

-- 읽기: 모두 가능
drop policy if exists "tags_select_all" on tags;
create policy "tags_select_all"   on tags   for select using (true);
drop policy if exists "topics_select_all" on topics;
create policy "topics_select_all" on topics for select using (true);
drop policy if exists "content_tags_select_all" on content_tags;
create policy "content_tags_select_all"   on content_tags   for select using (true);
drop policy if exists "content_topics_select_all" on content_topics;
create policy "content_topics_select_all" on content_topics for select using (true);

-- 쓰기: editor 이상
drop policy if exists "tags_write_editor" on tags;
create policy "tags_write_editor"
  on tags for all
  to authenticated
  using (
    site_id in (
      select site_id from site_members
      where user_id = auth.uid()
        and role in ('editor', 'site_admin', 'platform_admin')
    )
  );

drop policy if exists "topics_write_editor" on topics;
create policy "topics_write_editor"
  on topics for all
  to authenticated
  using (
    site_id in (
      select site_id from site_members
      where user_id = auth.uid()
        and role in ('editor', 'site_admin', 'platform_admin')
    )
  );


-- ============================================================
-- site_members — RLS
-- ============================================================
alter table site_members enable row level security;

-- 자신의 멤버십 읽기
drop policy if exists "site_members_select_self" on site_members;
create policy "site_members_select_self"
  on site_members for select
  to authenticated
  using (user_id = auth.uid());

-- site_admin 이상: 멤버 관리
drop policy if exists "site_members_manage_admin" on site_members;
create policy "site_members_manage_admin"
  on site_members for all
  to authenticated
  using (
    site_id in (
      select site_id from site_members sm2
      where sm2.user_id = auth.uid()
        and sm2.role in ('site_admin', 'platform_admin')
    )
  );


-- ============================================================
-- projects — RLS
-- ============================================================
alter table projects enable row level security;

-- 비로그인: published content의 project만 읽기
drop policy if exists "projects_select_published" on projects;
create policy "projects_select_published"
  on projects for select
  using (
    content_id in (
      select id from contents where status = 'published'
    )
  );

-- editor 이상: 수정
drop policy if exists "projects_write_editor" on projects;
create policy "projects_write_editor"
  on projects for all
  to authenticated
  using (
    site_id in (
      select site_id from site_members
      where user_id = auth.uid()
        and role in ('editor', 'site_admin', 'platform_admin')
    )
  );


-- ============================================================
-- organizations — RLS
-- ============================================================
alter table organizations enable row level security;

-- 읽기 전용 (플랫폼 내부용)
drop policy if exists "organizations_select_all" on organizations;
create policy "organizations_select_all"
  on organizations for select
  to authenticated
  using (true);

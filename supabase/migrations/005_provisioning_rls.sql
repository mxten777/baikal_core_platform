-- ============================================================
-- BAIKAL Core Platform — Provisioning RLS v1.0
--
-- 내용:
--   - platform_admin 전용 INSERT 정책 추가
--     * organizations: 신규 고객사 등록
--     * sites: 신규 사이트 등록
--     * site_settings: 신규 사이트 설정 등록
--     * site_members: 신규 사이트 초기 멤버 등록
--
-- platform_admin 판별:
--   Supabase Auth app_metadata.role = 'platform_admin'
--   → auth.jwt() -> 'app_metadata' ->> 'role'
--
-- 재실행 안전: DROP POLICY IF EXISTS 사용
-- ============================================================


-- 헬퍼 함수: 현재 사용자가 platform_admin인지 확인
-- (인라인 표현식으로 사용; 별도 함수 없이 직접 사용)


-- ============================================================
-- organizations — INSERT (platform_admin)
-- ============================================================
drop policy if exists "organizations_insert_platform_admin" on organizations;
create policy "organizations_insert_platform_admin"
  on organizations for insert
  to authenticated
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'platform_admin'
  );

-- organizations — UPDATE (platform_admin)
drop policy if exists "organizations_update_platform_admin" on organizations;
create policy "organizations_update_platform_admin"
  on organizations for update
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'platform_admin'
  );

-- organizations — SELECT (platform_admin: 전체 조회)
drop policy if exists "organizations_select_platform_admin" on organizations;
create policy "organizations_select_platform_admin"
  on organizations for select
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'platform_admin'
  );


-- ============================================================
-- sites — INSERT / UPDATE (platform_admin)
-- ============================================================
drop policy if exists "sites_insert_platform_admin" on sites;
create policy "sites_insert_platform_admin"
  on sites for insert
  to authenticated
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'platform_admin'
  );

drop policy if exists "sites_update_platform_admin" on sites;
create policy "sites_update_platform_admin"
  on sites for update
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'platform_admin'
  );

-- sites — SELECT (platform_admin: 전체 조회, 상태 무관)
drop policy if exists "sites_select_platform_admin" on sites;
create policy "sites_select_platform_admin"
  on sites for select
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'platform_admin'
  );


-- ============================================================
-- site_settings — INSERT (platform_admin)
-- ============================================================
drop policy if exists "site_settings_insert_platform_admin" on site_settings;
create policy "site_settings_insert_platform_admin"
  on site_settings for insert
  to authenticated
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'platform_admin'
  );


-- ============================================================
-- site_members — INSERT (platform_admin: 초기 멤버 등록)
-- ============================================================
drop policy if exists "site_members_insert_platform_admin" on site_members;
create policy "site_members_insert_platform_admin"
  on site_members for insert
  to authenticated
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'platform_admin'
  );

-- site_members — SELECT (platform_admin: 전체 조회)
drop policy if exists "site_members_select_platform_admin" on site_members;
create policy "site_members_select_platform_admin"
  on site_members for select
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'platform_admin'
  );

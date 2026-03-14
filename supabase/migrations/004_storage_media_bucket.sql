-- ============================================================
-- BAIKAL Core Platform — Storage: media 버킷 생성 및 RLS v1.0
--
-- 내용:
--   - 'media' 버킷 생성 (공개 버킷)
--   - Storage 오브젝트 RLS 정책
--     * 비로그인: 공개 파일 읽기 가능
--     * 인증 사용자: 자신의 사이트 폴더에 업로드/삭제 가능
--     * platform_admin(service_role): 모든 오브젝트 관리 가능
--
-- 재실행 안전: INSERT ... ON CONFLICT DO NOTHING 사용
-- ============================================================


-- ============================================================
-- 1. 'media' 버킷 생성
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,                     -- public bucket: getPublicUrl() 사용 가능
  52428800,                 -- 50 MB 제한
  array[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/avif',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do nothing;


-- ============================================================
-- 2. Storage RLS 정책
-- ============================================================

-- 비로그인(anon): public 버킷의 파일 읽기 허용 (CDN/공개 URL 접근)
drop policy if exists "media_objects_select_public" on storage.objects;
create policy "media_objects_select_public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');


-- 인증 사용자: 자신이 멤버인 사이트 폴더(sites/<site_id>/)에만 업로드 허용
-- 파일 경로 형식: sites/<site_id>/<timestamp>-<filename>.<ext>
drop policy if exists "media_objects_insert_member" on storage.objects;
create policy "media_objects_insert_member"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = 'sites'
    and (storage.foldername(name))[2] in (
      select site_id::text from site_members
      where user_id = auth.uid()
        and role in ('site_admin', 'editor')
    )
  );


-- 인증 사용자: 자신이 업로드한 파일 및 자신의 사이트 파일 삭제 허용
drop policy if exists "media_objects_delete_member" on storage.objects;
create policy "media_objects_delete_member"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = 'sites'
    and (storage.foldername(name))[2] in (
      select site_id::text from site_members
      where user_id = auth.uid()
        and role in ('site_admin', 'editor')
    )
  );


-- 인증 사용자: 자신의 사이트 파일 업데이트(메타데이터) 허용
drop policy if exists "media_objects_update_member" on storage.objects;
create policy "media_objects_update_member"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = 'sites'
    and (storage.foldername(name))[2] in (
      select site_id::text from site_members
      where user_id = auth.uid()
        and role in ('site_admin', 'editor')
    )
  );

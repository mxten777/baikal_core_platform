-- ============================================================
-- BAIKAL Core Platform — Seed Data v1.0
-- 개발 환경 초기 데이터
--
-- 주의: 운영 환경에서는 실행하지 않는다.
-- ============================================================

-- ============================================================
-- 1. organizations
-- ============================================================
insert into organizations (id, name, slug) values
  ('00000000-0000-0000-0000-000000000001', 'Baikal Systems', 'baikalsys'),
  ('00000000-0000-0000-0000-000000000002', 'Demo Organization', 'demo-org')
on conflict (slug) do nothing;


-- ============================================================
-- 2. sites
-- ============================================================
insert into sites (id, organization_id, slug, domain, name, type, status, template_id) values
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'baikalsys',
    'baikalsys.com',
    'Baikal Systems',
    'corporate',
    'active',
    'corporate'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'demo-site',
    'demo.baikal.dev',
    'Demo Expert Site',
    'expert',
    'active',
    'expert'
  )
on conflict (slug) do nothing;


-- ============================================================
-- 3. site_settings
-- ============================================================
insert into site_settings (site_id, locale, timezone, modules, meta, feature_flags) values
  (
    '10000000-0000-0000-0000-000000000001',
    'ko',
    'Asia/Seoul',
    array['blog', 'contact'],
    '{"title":"Baikal Systems","description":"기업 홈페이지 플랫폼","keywords":["baikal","platform"],"ogImage":null,"favicon":null}'::jsonb,
    '{"blog":true,"portfolio":false,"contact":true,"booking":false,"ecommerce":false,"mediaHub":false}'::jsonb
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'ko',
    'Asia/Seoul',
    array['portfolio', 'contact'],
    '{"title":"Demo Expert","description":"전문가 포트폴리오 데모 사이트","keywords":["demo","expert","portfolio"],"ogImage":null,"favicon":null}'::jsonb,
    '{"blog":false,"portfolio":true,"contact":true,"booking":false,"ecommerce":false,"mediaHub":false}'::jsonb
  )
on conflict (site_id) do nothing;


-- ============================================================
-- 4. tags (baikalsys)
-- ============================================================
insert into tags (site_id, name, slug) values
  ('10000000-0000-0000-0000-000000000001', '공지사항', 'notice'),
  ('10000000-0000-0000-0000-000000000001', '기술', 'tech'),
  ('10000000-0000-0000-0000-000000000001', '소식', 'news')
on conflict (site_id, slug) do nothing;

insert into tags (site_id, name, slug) values
  ('10000000-0000-0000-0000-000000000002', 'Web', 'web'),
  ('10000000-0000-0000-0000-000000000002', 'UI/UX', 'ui-ux'),
  ('10000000-0000-0000-0000-000000000002', 'Mobile', 'mobile')
on conflict (site_id, slug) do nothing;


-- ============================================================
-- 5. topics (baikalsys)
-- ============================================================
insert into topics (site_id, name, slug, description) values
  ('10000000-0000-0000-0000-000000000001', '개발', 'dev', '개발 관련 콘텐츠'),
  ('10000000-0000-0000-0000-000000000001', '비즈니스', 'business', '비즈니스 인사이트')
on conflict (site_id, slug) do nothing;


-- ============================================================
-- 6. 샘플 콘텐츠 (baikalsys 블로그)
-- ============================================================
insert into contents (id, site_id, type, slug, title, body, status, author_id, published_at, meta) values
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'post',
    'hello-baikal',
    'BAIKAL Core Platform을 소개합니다',
    '멀티사이트 플랫폼 엔진 BAIKAL Core Platform의 첫 번째 포스트입니다.',
    'published',
    (select id from auth.users limit 1),  -- 첫 번째 가입 사용자를 author로 설정
    now(),
    '{"title":"BAIKAL Core Platform 소개","description":"멀티사이트 플랫폼 엔진","ogImage":null,"tags":["notice"],"topics":["dev"]}'::jsonb
  )
on conflict (site_id, slug) do nothing;


-- ============================================================
-- 7. 샘플 폼 (baikalsys contact)
-- ============================================================
insert into forms (site_id, name, slug, schema, email_to, active) values
  (
    '10000000-0000-0000-0000-000000000001',
    '문의하기',
    'contact',
    '[
      {"name":"name","label":"이름","type":"text","required":true},
      {"name":"email","label":"이메일","type":"email","required":true},
      {"name":"message","label":"메시지","type":"textarea","required":true}
    ]'::jsonb,
    array['contact@baikalsys.com'],
    true
  )
on conflict (site_id, slug) do nothing;

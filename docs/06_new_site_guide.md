# BAIKAL Core Platform — 신규 고객사 사이트 적용 가이드

> 대상: 플랫폼 운영자 (platform_admin) / 개발 담당자
> 버전: 1.0.0 | 작성일: 2026-03-13

---

## 개요

이 가이드는 BAIKAL Platform에 **신규 고객사 사이트를 추가·오픈**하는 전체 절차를 다룹니다.

신규 사이트 개설에 드는 시간: **1~3일** (콘텐츠 입력 제외)

---

## 사전 확인 체크리스트

신규 사이트 개설 전 고객사와 협의할 항목입니다.

```
[ ] 사이트 이름 (예: ABC 컴퍼니)
[ ] 사이트 slug (소문자·하이픈, 예: abc-company)
[ ] 도메인 (예: abc-company.com) — 없으면 서브도메인으로 임시 운영 가능
[ ] 사이트 유형 (corporate / expert / 기타)
[ ] 템플릿 선택 (corporate / expert)
[ ] 활성화할 모듈 (blog / portfolio / contact)
[ ] 기본 SEO 정보 (타이틀, 설명, 키워드)
[ ] 관리자 이메일 계정 (초대할 담당자)
```

---

## Step 1 — DB에 조직·사이트 등록

Supabase **SQL Editor**에서 아래 쿼리를 실행합니다.

### 1-1. Organization 등록

```sql
INSERT INTO organizations (id, name, slug)
VALUES (
  uuid_generate_v4(),
  'ABC 컴퍼니',          -- 고객사명
  'abc-company'         -- slug (소문자·하이픈, 변경 불가)
);
```

조직 ID 확인:
```sql
SELECT id FROM organizations WHERE slug = 'abc-company';
-- 결과: <org-uuid> (다음 단계에 사용)
```

### 1-2. Site 등록

```sql
INSERT INTO sites (
  id,
  organization_id,
  slug,
  domain,
  name,
  type,
  status,
  template_id
)
VALUES (
  uuid_generate_v4(),
  '<org-uuid>',          -- 위에서 확인한 조직 UUID
  'abc-company',         -- 사이트 slug (URL에서 식별자로 사용)
  'abc-company.com',     -- 실제 도메인 (없으면 NULL)
  'ABC 컴퍼니',          -- 표시 이름
  'corporate',           -- site_type: corporate / hospital / commerce / expert / portfolio / content
  'active',
  'corporate'            -- templateId: corporate / expert
);
```

사이트 ID 확인:
```sql
SELECT id FROM sites WHERE slug = 'abc-company';
-- 결과: <site-uuid> (이후 모든 단계에서 사용)
```

### 1-3. Site Settings 등록

```sql
INSERT INTO site_settings (
  site_id,
  locale,
  timezone,
  modules,
  meta,
  feature_flags
)
VALUES (
  '<site-uuid>',
  'ko',
  'Asia/Seoul',
  -- 활성화할 모듈 목록 (moduleRegistry에 등록된 ID만 사용)
  ARRAY['blog', 'contact'],
  -- SEO 메타 정보
  '{
    "title": "ABC 컴퍼니",
    "description": "ABC 컴퍼니 공식 홈페이지",
    "keywords": ["abc", "company"],
    "ogImage": null,
    "favicon": null
  }'::jsonb,
  -- 기능 플래그 (modules와 일치하도록 설정)
  '{
    "blog": true,
    "portfolio": false,
    "contact": true,
    "booking": false,
    "ecommerce": false,
    "mediaHub": false
  }'::jsonb
);
```

> **modules 배열과 feature_flags는 일치해야 합니다.**
> modules에 `"blog"`가 있으면 feature_flags에도 `"blog": true` 필수.

---

## Step 2 — 로컬 Fallback 설정 (개발용)

DB 연결 없이 로컬 개발 시 사용합니다. Supabase 연결이 완료된 운영 환경에서는 선택사항입니다.

### 2-1. 사이트 설정 파일 생성

`src/sites/abc-company/site.config.ts` 파일 생성:

```typescript
import type { SiteConfig } from '@/types'

export const abcCompanyConfig: SiteConfig = {
  siteId: '<site-uuid>',         // Step 1에서 생성된 UUID
  slug: 'abc-company',
  name: 'ABC 컴퍼니',
  domain: 'abc-company.com',
  type: 'corporate',
  templateId: 'corporate',
  modules: ['blog', 'contact'],
  locale: 'ko',
  timezone: 'Asia/Seoul',
  meta: {
    title: 'ABC 컴퍼니',
    description: 'ABC 컴퍼니 공식 홈페이지',
    keywords: ['abc', 'company'],
    ogImage: null,
    favicon: null,
  },
  features: {
    blog: true,
    portfolio: false,
    contact: true,
    booking: false,
    ecommerce: false,
    mediaHub: false,
  },
}
```

### 2-2. settings.service.ts에 등록

`src/core/settings/settings.service.ts` 수정:

```typescript
// 기존 import들 아래에 추가
import { abcCompanyConfig } from '@sites/abc-company/site.config'

const LOCAL_CONFIGS: Record<string, SiteConfig> = {
  baikalsys: baikalsysConfig,
  'demo-site': demoSiteConfig,
  'abc-company': abcCompanyConfig,   // 추가
}
```

---

## Step 3 — 로컬 개발 환경에서 확인

`.env.local` 에서 사이트 slug를 변경하여 로컬에서 신규 사이트를 미리 확인합니다:

```env
VITE_SITE_SLUG=abc-company
```

개발 서버 실행:
```bash
npm run dev
# http://localhost:5173 에서 abc-company 사이트가 표시됨
```

정상 동작 확인:
- 홈 페이지 로딩 확인
- 활성화한 모듈 라우트 접근 확인: `/blog`, `/contact`
- 관리자 콘솔 접근: `http://localhost:5173/admin`

---

## Step 4 — 사용자 계정 생성 및 권한 설정

### 4-1. Supabase에서 사용자 초대

Supabase 대시보드 → `Authentication` → `Users` → `Invite User`:

1. 고객사 담당자 이메일 입력 후 **Invite**
2. 담당자가 이메일에서 초대 링크를 클릭하여 비밀번호 설정

### 4-2. 사용자 메타데이터에 역할 지정

SQL Editor에서:

```sql
-- Supabase auth.users 테이블에서 해당 사용자 ID 확인
SELECT id FROM auth.users WHERE email = 'manager@abc-company.com';

-- app_metadata에 역할과 사이트 ID 설정
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object(
  'role', 'site_admin',
  'site_id', '<site-uuid>'
)
WHERE email = 'manager@abc-company.com';
```

역할 설명:
| 역할 | 적합 대상 |
|------|----------|
| `site_admin` | 고객사 메인 담당자 (콘텐츠 + 미디어 + 사용자 초대) |
| `editor` | 고객사 콘텐츠 담당 직원 |
| `viewer` | 열람만 필요한 경우 |

---

## Step 5 — 태그 및 초기 콘텐츠 입력

### 5-1. 태그 등록 (선택사항)

```sql
INSERT INTO tags (site_id, name, slug) VALUES
  ('<site-uuid>', '공지사항', 'notice'),
  ('<site-uuid>', '회사소식', 'news'),
  ('<site-uuid>', '제품정보', 'product');
```

### 5-2. 기본 페이지 생성 (관리자 콘솔에서)

관리자 콘솔 접속 후 아래 페이지를 순서대로 작성합니다:

| 페이지 | 타입 | slug |
|--------|------|------|
| 회사 소개 | page | `about` |
| 서비스 안내 | page | `services` |
| 오시는 길 | page | `location` |

---

## Step 6 — 도메인 연결

### 6-1. Vercel에서 도메인 추가

```bash
vercel domains add abc-company.com
```

또는 Vercel 대시보드 → 프로젝트 → Settings → Domains → Add Domain

### 6-2. DNS 설정 (고객사 도메인 관리 패널에서)

| 타입 | 이름 | 값 |
|------|------|-----|
| A | `@` | `76.76.21.21` (Vercel IP) |
| CNAME | `www` | `cname.vercel-dns.com` |

### 6-3. 환경변수 설정 (운영 배포 시)

Vercel 대시보드 → 프로젝트 → Settings → Environment Variables:

```
VITE_SUPABASE_URL      = https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJ...
VITE_SITE_SLUG         = abc-company
PUBLIC_SITE_ID         = <site-uuid>
PUBLIC_BASE_URL        = https://abc-company.com
```

---

## Step 7 — 최종 검수 및 오픈

오픈 전 체크리스트:

```
[ ] 홈 페이지 정상 표시
[ ] 모든 활성 모듈 페이지 정상 표시 (/blog, /contact 등)
[ ] 관리자 로그인 및 콘텐츠 작성 테스트
[ ] 도메인 SSL(HTTPS) 적용 확인
[ ] SEO 메타태그 확인 (브라우저 탭 제목, 소스코드)
[ ] sitemap.xml 접근 확인: https://abc-company.com/sitemap.xml
[ ] robots.txt 확인: https://abc-company.com/robots.txt
[ ] 문의 폼 제출 테스트 → 관리자 콘솔 수신 확인
[ ] 모바일 화면 확인
[ ] 이미지 업로드 테스트 (미디어 관리)
```

---

## 빠른 참조 — 사이트 개설 5단계 요약

| 단계 | 작업 | 담당 |
|------|------|------|
| 1 | Supabase에 organizations + sites + site_settings 등록 | 개발팀 |
| 2 | `src/sites/<slug>/site.config.ts` 생성, `LOCAL_CONFIGS` 등록 | 개발팀 |
| 3 | 로컬에서 VITE_SITE_SLUG 변경 후 화면 확인 | 개발팀 |
| 4 | Supabase에서 관리자 계정 생성 + 역할 설정 | 개발팀 |
| 5 | Vercel 도메인 연결 + 환경변수 설정 + 배포 | 개발팀 |
| 6 | 초기 콘텐츠 입력 + 최종 검수 | 개발팀 + 고객사 |

---

## 트러블슈팅

### 사이트가 "Site not found" 오류를 표시할 때
1. DB의 `sites.slug`가 `VITE_SITE_SLUG` 값과 정확히 일치하는지 확인
2. `sites.status`가 `active`인지 확인
3. Supabase 연결이 안 될 경우 `LOCAL_CONFIGS`에 해당 slug가 있는지 확인

### 모듈 라우트에 접근 시 빈 페이지가 표시될 때
1. DB `site_settings.modules` 배열에 해당 모듈 ID가 있는지 확인
2. `feature_flags`에 해당 기능이 `true`인지 확인
3. `bootstrap.ts`에 해당 모듈이 등록되어 있는지 확인

### 관리자 로그인 후 권한 오류가 발생할 때
1. `auth.users`의 `raw_app_meta_data`에 `role`과 `site_id`가 올바르게 설정되어 있는지 확인
2. `site_id`가 DB의 `sites.id`와 일치하는지 확인

---

*이 가이드는 신규 사이트 개설을 위한 절차 문서입니다.*
*모듈·템플릿 개발은 [05_module_dev_guide.md](05_module_dev_guide.md)를 참조하세요.*

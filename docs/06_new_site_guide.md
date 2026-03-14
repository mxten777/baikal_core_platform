# BAIKAL Core Platform — 신규 고객사 사이트 개설 가이드

> 대상: 플랫폼 운영자 (platform_admin) / 개발 담당자
> 버전: 1.0.3 | 최종 수정: 2026-03-14

---

## 개요

BAIKAL Platform에 신규 고객사 사이트를 추가·오픈하는 전체 절차를 다룹니다.

**v1.0.3부터 Admin UI를 통해 DB 등록을 자동화할 수 있습니다.**  
수동 SQL 방식은 [부록 A](#부록-a--수동-sql-등록-방법)를 참조하세요.

신규 사이트 개설에 드는 시간: **수 분 ~ 1일** (콘텐츠 입력 제외)

---

## 사전 확인 체크리스트

신규 사이트 개설 전 고객사와 협의할 항목입니다.

```
[ ] 사이트 이름 (예: ABC 컴퍼니)
[ ] 사이트 slug (소문자·하이픈, 예: abc-company)  ← URL 식별자, 이후 변경 불가
[ ] 도메인 (예: abc-company.com) — 없으면 공백으로 등록 후 추후 도메인 연결
[ ] 사이트 유형 (corporate / expert / portfolio / hospital / commerce / content)
[ ] 템플릿 선택 (corporate / expert — 미구현 유형은 부록 참조)
[ ] 활성화할 모듈 (blog / portfolio / contact 중 선택)
[ ] 기본 SEO 정보 (페이지 타이틀, 설명, 키워드)
[ ] 관리자 이메일 계정 (Supabase 초대할 담당자)
```

---

## Step 1 — 사전 마이그레이션 실행 (최초 1회)

`005_provisioning_rls.sql`이 아직 실행되지 않은 경우 먼저 실행합니다.  
Supabase 대시보드 → **SQL Editor** → 새 쿼리 → 파일 내용 붙여넣기 → **Run**

```
supabase/migrations/005_provisioning_rls.sql
```

이 파일은 `platform_admin`이 Admin UI를 통해 DB에 직접 INSERT할 수 있도록 RLS 정책을 추가합니다.  
이미 실행했다면 이 단계를 건너뜁니다 (`DROP POLICY IF EXISTS`로 재실행 안전).

---

## Step 2 — Admin UI에서 사이트 등록

### 2-1. 접속

`platform_admin` 계정으로 관리자 콘솔에 로그인합니다.

```
https://<도메인>/admin
```

사이드바에 **"사이트 등록"** 메뉴가 표시됩니다.  
(`platform_admin` 역할이 아닌 계정에는 메뉴가 숨겨집니다.)

---

### 2-2. 폼 입력

`/admin/sites/new` 페이지에서 아래 항목을 입력합니다.

#### 고객사 (Organization)

| 필드 | 설명 | 예시 | 비고 |
|------|------|------|------|
| 고객사 이름 | 조직의 공식 이름 | `ABC 컴퍼니` | 필수 |
| 조직 Slug | 소문자·하이픈 식별자 | `abc-company` | 필수. 동일 slug가 이미 있으면 기존 조직을 재사용 |

> **같은 고객사의 두 번째 사이트**를 만들 때는 `orgSlug`를 동일하게 입력하면  
> 새 Organization을 생성하지 않고 기존 것을 연결합니다.

#### 사이트 기본 정보

| 필드 | 설명 | 예시 | 비고 |
|------|------|------|------|
| 사이트 이름 | 관리자 UI 및 SEO 타이틀 기본값 | `ABC 컴퍼니 홈페이지` | 필수 |
| 사이트 Slug | URL 식별자 | `abc-company` | 필수. 전체 시스템에서 중복 불가 |
| 도메인 | 실제 운영 도메인 | `abc-company.com` | 선택. 없으면 공백 |
| 사이트 유형 | DB에 저장되는 분류 코드 | `corporate` | 아래 유형 표 참조 |
| 템플릿 | UI 레이아웃 테마 | `corporate` | 현재 `corporate` / `expert` 구현됨 |

**사이트 유형 참조표**

| 유형 | 템플릿 | 적합 업종 |
|------|--------|----------|
| `corporate` | corporate | 일반 기업, 브랜드 사이트 |
| `expert` | expert | 전문가 개인 사이트, 컨설턴트 |
| `portfolio` | expert | 크리에이터, 디자이너 |
| `hospital` | *(미구현)* | 병원, 의원 |
| `commerce` | *(미구현)* | 쇼핑몰 |
| `content` | *(미구현)* | 미디어, 뉴스 |

#### 활성화 모듈

체크박스로 활성화할 모듈을 선택합니다.

| 모듈 | 제공 기능 | 라우트 |
|------|----------|--------|
| 블로그 | 포스트 목록 / 상세 | `/blog`, `/blog/:slug` |
| 포트폴리오 | 프로젝트 목록 / 상세 | `/portfolio`, `/portfolio/:slug` |
| 문의 폼 | 동적 필드 폼 + 제출 저장 | `/contact` |

> `feature_flags`는 선택한 모듈을 기반으로 **자동 생성**됩니다. 수동으로 맞출 필요 없습니다.

#### SEO 메타 정보

| 필드 | 설명 | 비고 |
|------|------|------|
| 페이지 타이틀 | `<title>` 태그 및 OG title | 비워두면 사이트 이름으로 자동 설정 |
| 설명 | `<meta name="description">` | 검색 결과에 표시되는 한 줄 요약 |
| 키워드 | `<meta name="keywords">` | 쉼표로 구분 입력 (예: `abc, company, 홈페이지`) |

#### 로케일

| 필드 | 기본값 | 선택지 |
|------|--------|--------|
| 언어 | `ko` | `ko` / `en` / `ja` |
| 타임존 | `Asia/Seoul` | `Asia/Seoul` / `UTC` / `America/New_York` / `Europe/London` |

---

### 2-3. 등록 실행

**"사이트 등록"** 버튼을 클릭합니다.

내부 처리 순서:
```
1. orgSlug 조회 → 없으면 organizations INSERT
2. siteSlug 중복 검사 → 중복이면 오류 반환
3. sites INSERT
4. site_settings INSERT (실패 시 sites DELETE 롤백)
```

---

### 2-4. 완료 화면 확인

등록 성공 시 완료 화면에 표시됩니다:

- **Site ID** (UUID) — 이후 사용자 권한 설정·Vercel 환경변수에 사용
- **Site Slug** — 확인용
- **local fallback 코드 스니펫** — 로컬 개발용 `site.config.ts` 전체 코드 자동 생성

> 코드 스니펫을 **복사**해 두세요. 다음 Step에서 사용합니다.

---

## Step 3 — 로컬 Fallback 설정 (개발용)

Supabase에 연결된 운영 환경에서는 선택사항이지만, 로컬 개발·테스트 시 필요합니다.

### 3-1. site.config.ts 파일 생성

완료 화면의 코드 스니펫을 그대로 복사하여 파일을 생성합니다.

경로: `src/sites/abc-company/site.config.ts`

```typescript
import type { SiteConfig } from '@/types'

export const abcCompanyConfig: SiteConfig = {
  siteId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',  // 완료 화면에서 복사
  slug: 'abc-company',
  name: 'ABC 컴퍼니 홈페이지',
  domain: 'abc-company.com',
  type: 'corporate',
  templateId: 'corporate',
  modules: ['blog', 'contact'],
  locale: 'ko',
  timezone: 'Asia/Seoul',
  meta: {
    title: 'ABC 컴퍼니 홈페이지',
    description: 'ABC 컴퍼니 공식 홈페이지',
    keywords: ['abc', 'company', '홈페이지'],
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

### 3-2. settings.service.ts에 등록

`src/core/settings/settings.service.ts` 수정:

```typescript
// 기존 import 아래에 추가
import { abcCompanyConfig } from '@sites/abc-company/site.config'

const LOCAL_CONFIGS: Record<string, SiteConfig> = {
  baikalsys: baikalsysConfig,
  'demo-site': demoSiteConfig,
  'abc-company': abcCompanyConfig,   // ← 추가
}
```

### 3-3. 로컬에서 확인

`.env.local`에서 사이트 slug를 변경합니다:

```env
VITE_SITE_SLUG=abc-company
```

개발 서버 실행 후 확인합니다:

```bash
npm run dev
# http://localhost:5173
```

확인 항목:
```
[ ] 홈 페이지 로딩
[ ] 활성화 모듈 라우트 접근 (/blog, /contact 등)
[ ] 관리자 콘솔 접근: http://localhost:5173/admin
```

---

## Step 4 — 관리자 계정 생성 및 권한 설정

### 4-1. 고객사 담당자 초대

Supabase 대시보드 → **Authentication** → **Users** → **Invite User**

1. 고객사 담당자 이메일 입력 후 **Invite**
2. 담당자가 초대 이메일의 링크를 클릭해 비밀번호 설정

### 4-2. 역할 및 사이트 ID 부여

Supabase **SQL Editor**에서 실행합니다.

```sql
-- 사용자 ID 확인
SELECT id FROM auth.users WHERE email = 'manager@abc-company.com';

-- app_metadata에 역할 + 사이트 ID 설정
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object(
  'role',    'site_admin',
  'site_id', '<Step 2에서 확인한 site-uuid>'
)
WHERE email = 'manager@abc-company.com';
```

**역할 선택 기준**

| 역할 | 권한 | 적합 대상 |
|------|------|----------|
| `site_admin` | 콘텐츠·미디어·폼·사이트 설정 전체 관리 | 고객사 메인 담당자 |
| `editor` | 콘텐츠·미디어 작성·수정 | 고객사 콘텐츠 담당 직원 |
| `viewer` | 읽기 전용 | 승인·검토 담당자 |
| `platform_admin` | 전체 사이트 관리 + 신규 사이트 등록 | 플랫폼 운영팀 내부 계정만 |

> `platform_admin`은 고객사에 절대 부여하지 마세요.

### 4-3. 로그인 테스트

담당자 이메일·비밀번호로 `https://<도메인>/login` 접속 → 관리자 콘솔 접근 확인

---

## Step 5 — 초기 콘텐츠 입력

### 5-1. 기본 페이지 작성 (관리자 콘솔)

`/admin/content/new?type=page` 에서 아래 페이지를 순서대로 작성합니다:

| 페이지 | 타입 | 권장 slug |
|--------|------|-----------|
| 회사 소개 | `page` | `about` |
| 서비스 안내 | `page` | `services` |
| 오시는 길 | `page` | `location` |

### 5-2. 태그 등록 (선택)

SQL Editor에서 등록합니다:

```sql
INSERT INTO tags (site_id, name, slug) VALUES
  ('<site-uuid>', '공지사항', 'notice'),
  ('<site-uuid>', '회사소식', 'news');
```

---

## Step 6 — Vercel 도메인 연결 및 배포

### 6-1. Vercel 환경변수 설정

Vercel 대시보드 → 프로젝트 → **Settings** → **Environment Variables**

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | Supabase anon key |
| `VITE_SITE_SLUG` | `abc-company` | 사이트 식별 slug |
| `PUBLIC_SITE_ID` | `<site-uuid>` | sitemap 생성용 UUID |
| `PUBLIC_BASE_URL` | `https://abc-company.com` | 공개 URL (sitemap href 기준) |

> 값에 **줄바꿈(`\n`)이 포함되지 않도록** 주의하세요. Vercel CLI 파이프 시 자동 삽입될 수 있습니다.

### 6-2. 도메인 추가

```bash
vercel domains add abc-company.com
```

또는 Vercel 대시보드 → 프로젝트 → **Domains** → **Add Domain**

### 6-3. DNS 설정 (고객사 도메인 관리 패널)

| 타입 | 이름 | 값 |
|------|------|-----|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

DNS 전파 시간: 최대 48시간 (보통 수 분~수 시간)

### 6-4. 프로덕션 배포

```bash
vercel --prod
```

---

## Step 7 — 최종 검수 및 오픈

오픈 전 체크리스트:

```
[ ] 홈 페이지 정상 표시
[ ] 모든 활성 모듈 페이지 확인 (/blog, /contact 등)
[ ] 관리자 로그인 → 콘텐츠 작성 테스트
[ ] 도메인 SSL(HTTPS) 적용 확인
[ ] SEO 메타태그 확인 (브라우저 탭 타이틀, 설명)
[ ] sitemap.xml: https://abc-company.com/sitemap.xml
[ ] robots.txt: https://abc-company.com/robots.txt
[ ] 문의 폼 제출 → 관리자 콘솔 수신 확인 (/admin/submissions)
[ ] 미디어 파일 업로드 테스트 (/admin/media)
[ ] 모바일 화면 확인
```

---

## 빠른 참조 — 전체 흐름 요약

```
0. 005_provisioning_rls.sql 실행 (최초 1회)
        ↓
1. platform_admin → /admin/sites/new 폼 입력 → "사이트 등록"
        ↓
2. 완료 화면: Site ID 복사 + local fallback 코드 스니펫 생성
        ↓
3. src/sites/<slug>/site.config.ts 생성
   settings.service.ts LOCAL_CONFIGS 추가
   .env.local VITE_SITE_SLUG 변경 → npm run dev 로컬 확인
        ↓
4. Supabase Auth → 고객사 담당자 초대
   app_metadata role/site_id 설정
        ↓
5. 관리자 콘솔 → 기본 페이지 작성
        ↓
6. Vercel 환경변수 설정 + 도메인 연결 + vercel --prod
        ↓
7. 최종 검수 → 오픈
```

| 단계 | 작업 | 소요 시간 |
|------|------|----------|
| 0–2 | DB 등록 (Admin UI) | ~5분 |
| 3 | 로컬 Fallback 설정 | ~10분 |
| 4 | 사용자 계정 설정 | ~5분 |
| 5 | 기본 콘텐츠 입력 | ~30분~ |
| 6 | 도메인 연결 + 배포 | ~1시간 (DNS 전파 별도) |
| 7 | 최종 검수 | ~30분 |

---

## 트러블슈팅

### "사이트 등록" 버튼이 에러를 반환할 때

| 에러 코드 | 원인 | 해결책 |
|-----------|------|--------|
| `SLUG_DUPLICATE` | 동일한 `siteSlug`가 이미 존재 | 다른 slug 사용 |
| `ORG_QUERY_FAILED` | Supabase RLS 오류 또는 연결 실패 | `005_provisioning_rls.sql` 재실행 |
| `SITE_CREATE_FAILED` | sites INSERT 실패 | Supabase 연결·권한 확인 |
| `SETTINGS_CREATE_FAILED` | site_settings INSERT 실패 (sites는 자동 롤백됨) | 동일 site_id의 중복 settings 여부 확인 |

### 사이드바에 "사이트 등록" 메뉴가 안 보일 때
- 현재 로그인 계정의 `app_metadata.role`이 `platform_admin`인지 확인합니다:
  ```sql
  SELECT raw_app_meta_data FROM auth.users WHERE email = 'your@email.com';
  ```

### 사이트가 "Site not found" 오류를 표시할 때
1. `sites.slug` = `VITE_SITE_SLUG` 정확히 일치하는지 확인
2. `sites.status = 'active'`인지 확인
3. Supabase 연결 실패 시 `LOCAL_CONFIGS`에 해당 slug가 있는지 확인

### 모듈 라우트에 접근 시 빈 페이지가 표시될 때
1. `site_settings.modules` 배열에 모듈 ID가 있는지 확인
2. `feature_flags`에 해당 기능이 `true`인지 확인
3. `bootstrap.ts`에 해당 모듈이 등록되어 있는지 확인

### 관리자 로그인 후 권한 오류가 발생할 때
1. `raw_app_meta_data`에 `role`과 `site_id`가 올바르게 설정되어 있는지 확인
2. `site_id`가 `sites.id`와 일치하는지 확인

---

## 부록 A — 수동 SQL 등록 방법

Admin UI를 사용할 수 없는 경우(RLS 미적용, 긴급 등), Supabase SQL Editor에서 직접 실행합니다.

### A-1. Organization 등록

```sql
INSERT INTO organizations (id, name, slug)
VALUES (uuid_generate_v4(), 'ABC 컴퍼니', 'abc-company')
ON CONFLICT (slug) DO NOTHING;

SELECT id FROM organizations WHERE slug = 'abc-company';
-- 결과 <org-uuid> 메모
```

### A-2. Site 등록

```sql
INSERT INTO sites (
  id, organization_id, slug, domain, name, type, status, template_id
) VALUES (
  uuid_generate_v4(),
  '<org-uuid>',
  'abc-company',
  'abc-company.com',   -- 없으면 NULL
  'ABC 컴퍼니',
  'corporate',
  'active',
  'corporate'
);

SELECT id FROM sites WHERE slug = 'abc-company';
-- 결과 <site-uuid> 메모
```

### A-3. Site Settings 등록

```sql
INSERT INTO site_settings (
  site_id, locale, timezone, modules, meta, feature_flags
) VALUES (
  '<site-uuid>',
  'ko',
  'Asia/Seoul',
  ARRAY['blog', 'contact'],
  '{
    "title": "ABC 컴퍼니",
    "description": "ABC 컴퍼니 공식 홈페이지",
    "keywords": ["abc", "company"],
    "ogImage": null,
    "favicon": null
  }'::jsonb,
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

> `modules` 배열과 `feature_flags` 값이 일치해야 합니다.

---

*모듈·템플릿 개발은 [05_module_dev_guide.md](05_module_dev_guide.md)를 참조하세요.*


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

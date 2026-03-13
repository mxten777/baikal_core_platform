# BAIKAL Core Platform — 프로젝트 설명서

> 버전: 1.0.0 | 작성일: 2026-03-13

---

## 1. 개요

**BAIKAL Core Platform**은 다수의 고객사 웹사이트를 단일 코드베이스로 운영하는 **멀티사이트 엔진(Multi-Tenant Web Platform Engine)**입니다.

- **한 번 구축 → 다수 고객사 운영**: 코드 수정 없이 데이터베이스 설정만으로 신규 사이트를 즉시 개설할 수 있습니다.
- **모듈형 기능 확장**: 블로그, 포트폴리오, 문의 폼 등 기능 모듈을 On/Off 방식으로 고객사별로 조합합니다.
- **템플릿 기반 UI**: 고객사 업종에 맞는 디자인 테마(corporate, expert 등)를 독립적으로 적용합니다.

---

## 2. 기술 스택

| 영역 | 기술 | 비고 |
|------|------|------|
| Frontend | Vite 6 · React 19 · TypeScript (strict) | SPA |
| 스타일 | TailwindCSS 3.4 | Utility-first CSS |
| 백엔드/DB | Supabase (PostgreSQL + Auth + Storage) | BaaS |
| 라우팅 | react-router-dom v7 (lazy routes) | Code-split |
| SEO | react-helmet-async | 메타태그 / sitemap |
| 테스트 | Vitest 3 + @testing-library/jest-dom | 34개 테스트 |
| 배포 | Vercel (SPA + Serverless Functions) | CDN 배포 |

---

## 3. 아키텍처 전체 구조

```
┌─────────────────────────────────────────────────────────┐
│                     Vercel CDN                          │
│  ┌───────────────┐    ┌─────────────────────────────┐  │
│  │  React SPA    │    │  Serverless Functions (api/) │  │
│  │  (Vite build) │    │  - sitemap.xml               │  │
│  │               │    │  - robots.txt                │  │
│  └───────────────┘    └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────── Supabase ─────────────────────────┐
│  PostgreSQL DB  │  Auth (JWT)  │  Storage (media)     │
└───────────────────────────────────────────────────────┘
```

---

## 4. 소스 디렉토리 구조

```
src/
├── core/                  ← 플랫폼 엔진 (핵심 불변 레이어)
│   ├── auth/              ← Supabase Auth + RBAC 권한 관리
│   ├── cms/               ← 콘텐츠 상태 관리 (draft/publish/archive)
│   ├── content/           ← 콘텐츠 CRUD + 동적 페이지 렌더링
│   ├── media/             ← 파일 업로드 (Supabase Storage)
│   ├── routing/           ← PlatformRouter + ProtectedRoute
│   ├── runtime/           ← RuntimeProvider (사이트 컨텍스트)
│   ├── seo/               ← SEO 메타태그 + SitemapGenerator
│   ├── settings/          ← 사이트 설정 로드 (DB + 로컬 fallback)
│   └── ui/                ← 공통 UI (NotFound, ErrorBoundary)
│
├── modules/               ← 기능 모듈 (고객사별 On/Off)
│   ├── blog/              ← 블로그 (목록/상세/서비스/훅)
│   ├── contact/           ← 문의 폼 (동적 필드 + XSS 방어)
│   └── portfolio/         ← 포트폴리오 (프로젝트 목록/상세)
│
├── templates/             ← 사이트 UI 테마 (레이아웃)
│   ├── corporate/         ← 기업 사이트 (밝은 테마)
│   └── expert/            ← 전문가 사이트 (다크 테마)
│
├── sites/                 ← 사이트별 로컬 설정 (DB fallback)
│   ├── baikalsys/         ← corporate 타입 예시
│   └── demo-site/         ← expert 타입 예시
│
└── app/
    ├── admin/             ← 관리자 UI (4개 페이지)
    ├── bootstrap.ts       ← 플랫폼 초기화 (모듈/템플릿 등록)
    └── registry/          ← Module · Template · Home 레지스트리
```

---

## 5. 핵심 동작 흐름

### 5-1. 사이트 부팅 흐름

```
브라우저 접속
     │
     ▼
[main.tsx]
 └─ <RuntimeProvider>
       │
       ▼  resolveSiteSlug()  ←── URL 쿼리(?site=) / VITE_SITE_SLUG / hostname
       │
       ▼  settingsService.loadSiteConfig(slug)
       │       ├─ Supabase DB 조회 (sites + site_settings)
       │       └─ 실패 시 로컬 fallback (src/sites/<slug>/site.config.ts)
       │
       ▼  RuntimeContext 확정 { site, user, isAdmin }
       │
       ▼
[PlatformRouter]
 ├─ templateRegistry.get(site.templateId)  →  레이아웃 렌더링
 ├─ homeRegistry.get(site.templateId)      →  홈 페이지 렌더링
 └─ moduleRegistry → site.modules          →  라우트 동적 등록
```

### 5-2. 멀티테넌시 격리

- 모든 DB 쿼리에 `site_id` 조건이 필수로 포함됩니다.
- Supabase Row Level Security(RLS)가 테이블 레벨에서 사이트 격리를 보장합니다.
- 스토리지는 `sites/{siteId}/` 경로 prefix로 격리됩니다.

---

## 6. 데이터베이스 스키마 (주요 테이블)

| 테이블 | 역할 |
|--------|------|
| `organizations` | 고객사 조직 (상위 엔티티) |
| `sites` | 개별 사이트 (slug, domain, template_id) |
| `site_settings` | 사이트별 모듈/메타/기능플래그 설정 |
| `contents` | CMS 콘텐츠 (page/post/project/product) |
| `tags` | 콘텐츠 태그 마스터 |
| `media_assets` | 업로드 파일 메타데이터 |
| `form_schemas` | 동적 문의 폼 스키마 |
| `form_submissions` | 폼 제출 데이터 |
| `users` | 플랫폼/사이트 사용자 (Supabase Auth 연동) |

---

## 7. 권한 체계 (RBAC)

| 역할 | 영문 | 범위 | 주요 권한 |
|------|------|------|----------|
| 플랫폼 관리자 | `platform_admin` | 전체 사이트 | 모든 사이트 접근·설정 변경 |
| 사이트 관리자 | `site_admin` | 담당 사이트 | 콘텐츠 관리, 사용자 초대 |
| 에디터 | `editor` | 담당 사이트 | 콘텐츠 작성·발행 |
| 뷰어 | `viewer` | 담당 사이트 | 읽기 전용 |

---

## 8. 모듈 목록

| 모듈 ID | 기능 | 라우트 |
|---------|------|--------|
| `blog` | 블로그 포스트 목록/상세 | `/blog`, `/blog/:slug` |
| `portfolio` | 프로젝트 포트폴리오 | `/portfolio`, `/portfolio/:slug` |
| `contact` | 문의 폼 (동적 필드) | `/contact` |

---

## 9. 템플릿 목록

| 템플릿 ID | 적합 업종 | 특징 |
|-----------|----------|------|
| `corporate` | 기업·제조·B2B | 밝은 테마, 헤더+푸터 레이아웃 |
| `expert` | 전문가·컨설턴트·개인 | 다크 테마, 미니멀 레이아웃 |

---

## 10. 보안 설계 원칙

1. **RLS(Row Level Security)**: 모든 테이블에 사이트 격리 정책 적용
2. **RBAC**: 모든 CMS API 호출에서 역할 검사 수행
3. **XSS 방어**: 문의 폼 입력값 sanitize (태그 제거)
4. **보안 헤더**: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` (vercel.json)
5. **입력 검증**: slug 자동 생성 시 허용 문자 화이트리스트 적용

---

## 11. 테스트 현황

```bash
npm run test    # 34개 테스트 — 전체 통과
```

| 테스트 파일 | 시나리오 수 | 커버리지 영역 |
|------------|------------|-------------|
| `auth.service.test.ts` | 7 | RBAC 권한 계층 검사 |
| `seo.service.test.ts` | 4 | 메타태그 생성, robots.txt |
| `settings.service.test.ts` | 4 | DB/fallback/캐시 |
| `RuntimeProvider.test.ts` | 5 | 슬러그 해석 로직 |
| `blog.service.test.ts` | 5 | 블로그 서비스 |
| `contact.service.test.ts` | 4 | XSS sanitize |
| `registry.test.ts` | 5 | 모듈/템플릿 레지스트리 |

---

## 12. 개발 환경 시작

```bash
# 1. 의존성 설치
npm install --legacy-peer-deps

# 2. 환경변수 설정
cp .env.example .env.local
# .env.local에 Supabase URL, anon key, VITE_SITE_SLUG 입력

# 3. Supabase 마이그레이션
supabase db push

# 4. 개발 서버 실행
npm run dev       # http://localhost:5173
```

---

## 13. 배포 (Vercel)

```bash
vercel --prod
```

필수 환경변수: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SITE_SLUG`

---

*이 문서는 기술적 이해를 위한 프로젝트 설명서입니다.*
*관리자 운영은 [02_admin_manual.md](02_admin_manual.md)를, 신규 사이트 개설은 [05_new_site_guide.md](05_new_site_guide.md)를 참조하세요.*

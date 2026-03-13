# BAIKAL Core Platform

멀티사이트 웹 플랫폼 엔진 — Vite + React 19 + TypeScript + Supabase + Vercel

---
비밀번호:  4JWbc8f05v7yZfCX  
## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Vite 6, React 19, TypeScript (strict) |
| Styling | TailwindCSS 3.4 |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Routing | react-router-dom v7 (lazy routes) |
| SEO | react-helmet-async |
| Testing | Vitest 3 + @testing-library/jest-dom |
| Deploy | Vercel (SPA + Serverless Functions) |

---

## 로컬 개발 시작

### 1. 의존성 설치

```bash
npm install --legacy-peer-deps
```

> `react-helmet-async`가 React 19 peerDeps를 아직 지원하지 않아 `--legacy-peer-deps` 플래그가 필요합니다.

### 2. 환경변수 설정

```bash
cp .env.example .env.local
```

`.env.local`을 열고 Supabase 프로젝트 URL과 anon key를 입력합니다.

### 3. Supabase 마이그레이션 실행

```bash
# Supabase CLI가 설치되어 있어야 합니다.
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

마이그레이션 파일 순서:
1. `supabase/migrations/001_initial_schema.sql` — 테이블 + 인덱스 + 트리거
2. `supabase/migrations/002_rls_policies.sql` — Row Level Security
3. `supabase/migrations/003_seed_data.sql` — 개발용 초기 데이터

### 4. 개발 서버 실행

```bash
npm run dev
```

기본 포트: `http://localhost:5173`

---

## 프로젝트 구조

```
src/
├── core/               # 플랫폼 코어 엔진
│   ├── auth/           # 인증 (Supabase Auth + RBAC)
│   ├── cms/            # 콘텐츠 관리 (draft/publish/archive)
│   ├── content/        # 콘텐츠 CRUD + DynamicPage
│   ├── media/          # 파일 업로드 (Supabase Storage)
│   ├── routing/        # PlatformRouter + ProtectedRoute
│   ├── runtime/        # RuntimeProvider (사이트 컨텍스트)
│   ├── seo/            # SEO 메타 + SitemapGenerator
│   ├── settings/       # 사이트 설정 (DB + 로컬 fallback)
│   └── ui/             # 공통 UI (NotFound, ErrorBoundary)
│
├── modules/            # 기능 모듈 (플러그인)
│   ├── blog/           # 블로그 (목록/상세)
│   ├── contact/        # 문의 폼 (동적 폼 렌더링)
│   └── portfolio/      # 포트폴리오 (목록/상세)
│
├── templates/          # 사이트 템플릿
│   ├── corporate/      # 기업 사이트 (밝은 테마)
│   └── expert/         # 전문가 사이트 (다크 테마)
│
├── sites/              # 사이트별 설정 (DB fallback)
│   ├── baikalsys/      # corporate 타입 예시
│   └── demo-site/      # expert 타입 예시
│
└── app/
    ├── admin/          # 관리자 UI (CMS, 미디어, 폼 제출)
    ├── bootstrap.ts    # 플랫폼 초기화 (템플릿/모듈 등록)
    └── registry/       # Module / Template / Home 레지스트리

api/                    # Vercel Serverless Functions
├── sitemap.xml.ts      # 동적 sitemap 생성
└── robots.txt.ts       # 환경별 robots.txt

supabase/
└── migrations/         # SQL 마이그레이션 (순서대로 실행)
```

---

## 명령어

```bash
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 결과 미리보기
npm run test         # 테스트 실행
npm run test:watch   # 테스트 watch 모드
npm run lint         # ESLint
```

---

## Vercel 배포

### 환경변수 설정

Vercel 대시보드 또는 CLI로 아래 변수를 설정합니다:

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbGci...` |
| `VITE_SITE_SLUG` | 기본 사이트 slug | `baikalsys` |
| `PUBLIC_SITE_ID` | sitemap 생성용 사이트 UUID | `10000000-...` |
| `PUBLIC_BASE_URL` | 사이트 공개 URL | `https://baikalsys.com` |

### 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 최초 배포 (프로젝트 연결)
vercel

# 프로덕션 배포
vercel --prod
```

`vercel.json`에 다음이 설정되어 있습니다:
- `/sitemap.xml` → `/api/sitemap.xml` rewrite
- `/robots.txt` → `/api/robots.txt` rewrite
- SPA fallback (`/*` → `/index.html`)
- 보안 헤더 (X-Frame-Options, X-Content-Type-Options 등)

---

## 멀티사이트 추가 방법

1. `src/sites/<slug>/site.config.ts` 생성
2. `src/core/settings/settings.service.ts`의 `LOCAL_CONFIGS`에 추가
3. Supabase `sites` 테이블에 레코드 추가
4. 필요한 경우 새 템플릿 `src/templates/<name>/`에 구현
5. `src/app/bootstrap.ts`에 등록

---

## 테스트

```bash
npm run test          # 전체 실행 (34개)
npm run test:watch    # watch 모드
```

테스트 파일:
- `src/core/auth/auth.service.test.ts` — RBAC 권한 검사
- `src/core/seo/seo.service.test.ts` — SEO 메타 생성
- `src/core/settings/settings.service.test.ts` — DB/fallback/캐시
- `src/core/runtime/RuntimeProvider.test.ts` — 사이트 slug 해석
- `src/modules/blog/blog.service.test.ts` — 블로그 서비스
- `src/modules/contact/contact.service.test.ts` — XSS sanitize
- `src/app/registry/registry.test.ts` — 모듈/템플릿 레지스트리

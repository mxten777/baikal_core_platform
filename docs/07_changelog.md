# BAIKAL Core Platform — 변경 이력 & 기술부채 관리

> 이 문서는 버전별 변경사항, 발견된 기술부채, 수정 이력을 기록합니다.
> 코드 수정 시 반드시 이 문서에 항목을 추가하세요.

---

## 기술부채 체크리스트 (업그레이드 시 확인)

업그레이드 작업 전후에 아래 항목을 점검하세요.

| 영역 | 점검 항목 |
|------|-----------|
| 의존성 | `npm audit` 취약점 확인 |
| 의존성 | 중복/미사용 패키지 확인 (`npm ls`) |
| 타입 | `npm run typecheck` 오류 없음 |
| 빌드 | `npm run build` 오류 없음 |
| 테스트 | `npm run test:run` 전체 통과 |
| alias | `vite.config.ts` alias가 실제 폴더와 일치하는지 확인 |
| Supabase | migration 파일 재실행 가능성 (`IF NOT EXISTS`, `DROP ... IF EXISTS`) |
| 환경변수 | Vercel 환경변수 값에 줄바꿈(`\n`) 포함 여부 확인 |
| 보안 | RLS 정책이 새 테이블에 적용되었는지 확인 |

---

## v1.0.3 — 2026-03-14

### 새 기능: 사이트 프로비저닝 자동화

| 파일 | 내용 |
|------|------|
| `supabase/migrations/005_provisioning_rls.sql` | `platform_admin` 전용 INSERT/SELECT/UPDATE RLS 정책 추가 (organizations, sites, site_settings, site_members) |
| `src/core/settings/provisioning.service.ts` | `provisionSite()` — Org → Site → SiteSettings 자동 생성. slug 중복 검사 + 실패 시 Site 롤백 |
| `src/app/admin/pages/SiteProvisioningPage.tsx` | Admin UI 폼 — 고객사 정보·모듈·SEO 입력 후 DB 자동 등록. 완료 후 local fallback 코드 스니펫 자동 생성 |
| `src/app/admin/AdminLayout.tsx` | "사이트 등록" 메뉴 추가 (platform_admin에게만 표시) |
| `src/core/routing/PlatformRouter.tsx` | `/admin/sites/new` 라우트 등록 (lazy load) |

### 동작 방식

```
platform_admin 로그인
  → Admin 사이드바 "사이트 등록" 클릭
  → /admin/sites/new 폼
  → 고객사명·slug·사이트명·도메인·유형·템플릿·모듈·SEO 입력
  → "사이트 등록" 버튼
  → provisioningService.provisionSite() 호출
      1. organizations INSERT (기존 slug면 재사용)
      2. sites INSERT
      3. site_settings INSERT (실패 시 site 롤백)
  → 완료 화면: siteId 표시 + local fallback 코드 스니펫 자동 생성
```

> **Supabase 실행 필요**: `005_provisioning_rls.sql`을 SQL Editor에서 실행하세요.

---

## v1.0.2 — 2026-03-14

### 보안 수정

| 파일 | 수정 내용 |
|------|-----------|
| `package.json` | `overrides` 추가: `path-to-regexp@6.3.0`, `undici@6.24.0`, `@vercel/python-analysis>minimatch@10.2.4`, `@vercel/static-config>ajv@8.18.0` — `@vercel/node` 중첩 의존성 취약점 8개(high 6 + moderate 2) → 0개 해소 |
| `README.md` | 평문 비밀번호 노출 제거 |

### 기능 추가

| 파일 | 수정 내용 |
|------|-----------|
| `supabase/migrations/004_storage_media_bucket.sql` | `media` 버킷 생성 + Storage RLS 정책 (선택 허용 / 사이트 멤버 업로드·삭제) — `core/media` 모듈 버킷 미생성 기술부채 해소 |

---

## v1.0.1 — 2026-03-13

### 버그 수정

| 파일 | 수정 내용 |
|------|-----------|
| `src/core/runtime/RuntimeProvider.tsx` | `vercel.app`, `netlify.app` 등 호스팅 플랫폼 도메인에서 슬러그를 잘못 파싱하는 버그 수정 → `VITE_DEFAULT_SITE` fallback 사용 |
| `src/core/runtime/RuntimeProvider.tsx` | `VITE_SITE_SLUG`, `VITE_DEFAULT_SITE` 환경변수에 `.trim()` 추가 (Vercel CLI 파이프 시 줄바꿈 삽입 대응) |
| `src/lib/supabase.ts` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 환경변수에 `.trim()` 추가 |
| `supabase/migrations/001_initial_schema.sql` | `create type` → `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object` 블록으로 교체 (재실행 가능) |
| `supabase/migrations/001_initial_schema.sql` | `create index` → `create index if not exists`로 교체 |
| `supabase/migrations/001_initial_schema.sql` | `create trigger` → `drop trigger if exists` + `create trigger`로 교체 |
| `supabase/migrations/002_rls_policies.sql` | 모든 `create policy` 앞에 `drop policy if exists` 추가 (재실행 가능) |

### 기술부채 해소

| # | 파일 | 내용 |
|---|------|------|
| 1 | `package.json` | `react-helmet` (구버전) 제거 — `react-helmet-async`와 중복 |
| 2 | `src/app/bootstrap.ts` | `(registry as unknown as { store: Map })` 우회 접근 제거 → `registry.keys()` 메서드 추가 |
| 3 | `src/app/registry/moduleRegistry.ts` | `keys(): string[]` 메서드 추가 |
| 4 | `src/app/registry/templateRegistry.ts` | `keys(): string[]` 메서드 추가 |
| 5 | `vite.config.ts` | 존재하지 않는 alias 제거: `@hooks`, `@utils`, `@components` |
| 6 | `src/core/content/useContent.ts` | `useEffect` deps `JSON.stringify(opts)` 우회 → 개별 필드 나열로 수정 |
| 7 | `supabase/migrations/003_seed_data.sql` | 샘플 콘텐츠 `author_id` 하드코딩 UUID 제거 → `(select id from auth.users limit 1)` 으로 수정 |

### 배포 작업

| 작업 | 내용 |
|------|------|
| Vercel 환경변수 설정 | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SITE_SLUG`, `VITE_DEFAULT_SITE` |
| Supabase DB 초기화 | `001_initial_schema.sql` → `002_rls_policies.sql` → `003_seed_data.sql` 순서로 실행 |

---

## 잔여 기술부채 (미해결)

| 우선순위 | 영역 | 내용 | 이유 |
|---------|------|------|------|
| 중 | `SiteType` | `hospital`, `commerce`, `portfolio`, `content` 타입이 있지만 템플릿/모듈 미구현 | 미래 확장용으로 남겨둠 |
| 중 | `SiteFeatureFlags` | `booking`, `ecommerce`, `mediaHub` 플래그가 있지만 실제 모듈 없음 | 미래 확장용으로 남겨둠 |
| ~~하~~ ✅ | ~~`npm audit`~~ | ~~8개 취약점 (moderate 3, high 5)~~ | **v1.0.2에서 overrides로 해소** |
| ~~중~~ ✅ | ~~`core/media`~~ | ~~Storage 버킷명 `'media'` 하드코딩 — Supabase에서 버킷 생성 필요~~ | **v1.0.2 `004_storage_media_bucket.sql`로 해소** |

---

## 변경 이력 작성 규칙

새 버전 작업 시 아래 형식으로 맨 위(최신순)에 추가:

```markdown
## vX.Y.Z — YYYY-MM-DD

### 새 기능
- ...

### 버그 수정
| 파일 | 수정 내용 |
|------|-----------|
| ... | ... |

### 기술부채 해소
| # | 파일 | 내용 |
|---|------|------|
| 1 | ... | ... |

### 잔여 기술부채 추가/제거
- 추가: ...
- 해소: ...
```

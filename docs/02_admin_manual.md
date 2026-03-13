# BAIKAL Core Platform — 관리자 매뉴얼 (슈퍼바이저)

> 대상: 플랫폼 운영자 (platform_admin) 및 사이트 관리자 (site_admin)
> 버전: 1.0.0 | 작성일: 2026-03-13

---

## 1. 관리자 권한 체계

플랫폼에는 4단계 권한이 있습니다.

```
platform_admin  ──▶  모든 사이트 접근 + 플랫폼 설정 변경
     │
site_admin      ──▶  담당 사이트만 접근 + 사용자 초대 + 콘텐츠 관리
     │
editor          ──▶  콘텐츠 작성·발행 (담당 사이트)
     │
viewer          ──▶  읽기 전용 (담당 사이트)
```

> **슈퍼바이저(platform_admin)** 는 모든 고객사 사이트에 접근하고, 신규 사이트를 개설하며, 사용자 역할을 지정할 수 있습니다.

---

## 2. 관리자 콘솔 접속

### 접속 URL
```
https://<사이트도메인>/admin
```

예시:
- `https://baikalsys.com/admin`
- `http://localhost:5173/admin` (개발환경)

### 로그인
1. 이메일 · 비밀번호 입력 후 **로그인** 클릭
2. `editor` 이상 권한이 없으면 자동으로 홈으로 리다이렉트됩니다.
3. 로그인 후 헤더 우측에 현재 사용자 이메일이 표시됩니다.

---

## 3. 관리자 콘솔 화면 구성

```
┌──────────────────────────────────────────────────┐
│  BAIKAL Admin                                    │
│ ─────────────────                                │
│  대시보드          ← /admin                      │
│  콘텐츠            ← /admin/content              │
│  폼 제출           ← /admin/submissions          │
│  미디어            ← /admin/media                │
│                                                  │
│  ─────────────────                               │
│  user@example.com                                │
│  [로그아웃]                                      │
└──────────────────────────────────────────────────┘
```

---

## 4. 대시보드

`/admin` 접속 시 표시되는 홈 화면입니다.

- **현재 사이트 정보**: 사이트명, 도메인, 템플릿, 활성 모듈 목록 표시
- **빠른 작업 버튼**: 새 포스트 작성 / 새 페이지 작성 / 폼 제출 확인 / 미디어 라이브러리

---

## 5. 콘텐츠 관리

### 5-1. 콘텐츠 목록 조회

`/admin/content` 에서:
- 해당 사이트의 모든 콘텐츠(draft/published/archived)를 조회합니다.
- **타입 필터**: `?type=post`, `?type=page`, `?type=project`
- 상태별 색상:
  - 초록 = published (발행됨)
  - 회색 = draft (초안)
  - 빨강 = archived (보관됨)

### 5-2. 새 콘텐츠 작성

1. **[새 콘텐츠]** 버튼 클릭 → `/admin/content/new`
2. **제목 입력**: 입력 즉시 slug 자동 생성 (영문·숫자·하이픈)
3. **타입 선택**: 포스트 / 페이지 / 프로젝트
4. **본문 작성**: 텍스트 에디터 영역에 입력
5. **slug 확인**: 중복 시 빨간 경고 표시 → 직접 수정
6. 저장 방법:
   - **[초안 저장]**: 발행하지 않고 저장 (status = draft)
   - **[즉시 발행]**: 바로 공개 (status = published)
7. 저장 후 콘텐츠 목록으로 자동 이동

### 5-3. 콘텐츠 편집

- 목록에서 **[편집]** 클릭 → `/admin/content/:id/edit`
- 편집 모드에서는 slug 자동 변경이 비활성화됩니다. (직접 변경 가능)
- 동일하게 **[초안 저장]** / **[즉시 발행]**으로 저장

### 5-4. 콘텐츠 발행 워크플로

```
작성 (draft)
    │
    ▼  [즉시 발행] 또는 cmsService.publish()
발행 (published)
    │
    ▼  cmsService.archive()
보관 (archived)
```

> **주의**: 보관된 콘텐츠는 공개 페이지에서 표시되지 않습니다.
> 복원하려면 개발팀에 직접 status 변경을 요청하세요.

---

## 6. 폼 제출 관리

`/admin/submissions` 에서 고객 문의 내역을 확인합니다.

- 제출 일시, 이름, 이메일, 메시지 등 항목 표시
- 테이블 형식으로 최신 순 정렬
- (향후) CSV 내보내기, 스팸 표시 기능 추가 예정

---

## 7. 미디어 관리

`/admin/media` 에서 이미지·파일을 관리합니다.

### 업로드
1. **[파일 업로드]** 버튼 클릭
2. 파일 선택 (이미지, 영상, 문서 등)
3. alt 텍스트 입력 (선택사항 — SEO·접근성에 권장)
4. 업로드 완료 후 목록에 즉시 표시

### 파일 저장 위치
```
Supabase Storage > media 버킷 > sites/{사이트ID}/{타임스탬프}-{파일명}
```

### 파일 삭제
- 목록에서 파일 선택 후 **[삭제]** 클릭
- Storage에서도 동시에 제거됩니다.

---

## 8. 신규 사이트 개설 (platform_admin 전용)

> 상세 절차는 **[신규 고객사 사이트 적용 가이드](05_new_site_guide.md)** 참조

빠른 요약:
1. Supabase에 `organizations` + `sites` + `site_settings` 레코드 추가
2. `src/sites/<slug>/site.config.ts` 생성 (개발 환경 fallback)
3. `src/core/settings/settings.service.ts`의 `LOCAL_CONFIGS`에 등록
4. 필요 시 새 템플릿 구현 + `bootstrap.ts`에 등록

---

## 9. 사용자 계정 관리

### 사용자 초대
Supabase 콘솔(**Authentication** 탭)에서 관리합니다:
1. Supabase 대시보드 → **Authentication** → **Users** → **Invite User**
2. 이메일 입력 후 초대 발송
3. 사용자 가입 후 `app_metadata.role`에 역할 설정:
   ```json
   { "role": "site_admin", "site_id": "<사이트UUID>" }
   ```

### 역할 변경
Supabase 콘솔 또는 서비스 키를 사용한 Admin API 호출로 변경합니다.

---

## 10. 사이트 설정 변경

### DB에서 직접 변경
Supabase SQL Editor에서:
```sql
-- 모듈 추가/제거 예시
UPDATE site_settings
SET modules = '["blog", "contact", "portfolio"]'
WHERE site_id = '<사이트UUID>';

-- 기능 플래그 변경 예시
UPDATE site_settings
SET feature_flags = '{"blog": true, "portfolio": true, "contact": true, "booking": false, "ecommerce": false, "mediaHub": false}'
WHERE site_id = '<사이트UUID>';
```

### 메타 정보 변경 (SEO)
```sql
UPDATE site_settings
SET meta = '{
  "title": "새 사이트명",
  "description": "사이트 설명",
  "keywords": ["키워드1", "키워드2"],
  "ogImage": "https://...",
  "favicon": null
}'
WHERE site_id = '<사이트UUID>';
```

---

## 11. 배포 관리

### 프로덕션 배포
```bash
vercel --prod
```

### 환경변수 확인
```bash
vercel env ls
```

| 변수명 | 용도 |
|--------|------|
| `VITE_SUPABASE_URL` | DB 연결 URL |
| `VITE_SUPABASE_ANON_KEY` | 공개 API 키 |
| `VITE_SITE_SLUG` | 기본 사이트 slug |
| `PUBLIC_SITE_ID` | sitemap 생성용 사이트 UUID |
| `PUBLIC_BASE_URL` | 사이트 공개 URL |

---

## 12. 모니터링 및 장애 대응

### DB 연결 실패 시
- 설정 서비스가 `LOCAL_CONFIGS` 로컬 fallback으로 자동 전환합니다.
- 사용자에게는 정상 페이지가 표시됩니다.
- Supabase 대시보드에서 연결 상태를 확인하세요.

### 사이트가 로딩되지 않을 때
1. Vercel Deployments 탭에서 최신 배포 상태 확인
2. Function Logs에서 서버사이드 에러 확인
3. 브라우저 콘솔에서 `[BAIKAL]` 로그 메시지 확인

### 컨텐츠가 표시되지 않을 때
- 콘텐츠 상태가 `published`인지 확인 (admin → 콘텐츠 목록)
- RLS 정책이 `site_id`가 일치하는지 확인

---

## 13. 주요 URL 참조

| 용도 | URL |
|------|-----|
| 관리자 콘솔 | `https://<도메인>/admin` |
| 로그인 | `https://<도메인>/login` |
| Supabase 콘솔 | `https://supabase.com/dashboard` |
| Vercel 대시보드 | `https://vercel.com/dashboard` |

---

*이 매뉴얼은 플랫폼 운영자 및 슈퍼바이저를 위한 문서입니다.*
*일반 고객사 운영자 매뉴얼은 [03_user_manual.md](03_user_manual.md)를 참조하세요.*

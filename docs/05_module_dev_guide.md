# BAIKAL Core Platform — 공통 모듈 개발 가이드

> 대상: 플랫폼 개발자 (새 기능 모듈 또는 템플릿 추가 담당)
> 버전: 1.0.0 | 작성일: 2026-03-13

---

## 1. 개요

BAIKAL Platform의 기능은 **모듈(Module)** 과 **템플릿(Template)** 두 가지 확장 단위로 구성됩니다.

| 확장 단위 | 역할 | 예시 |
|----------|------|------|
| **모듈** | 기능(라우트+서비스+UI) 단위 | blog, portfolio, contact |
| **템플릿** | 전체 레이아웃(디자인 테마) | corporate, expert |

> **핵심 원칙**: 새 모듈·템플릿은 `src/core/` 를 절대 수정하지 않습니다.
> 오직 `src/modules/`, `src/templates/`, `src/app/bootstrap.ts` 만 변경합니다.

---

## 2. 모듈 구조 규약

### 폴더 구조

```
src/modules/<모듈ID>/
├── index.ts              ← RegisteredModule 정의 + 라우트 등록 (필수)
├── components/           ← React 컴포넌트 (페이지 등)
│   ├── <이름>ListPage.tsx
│   └── <이름>DetailPage.tsx
├── hooks/                ← 커스텀 훅
│   └── use<이름>.ts
├── services/             ← 비즈니스 로직 (DB 접근)
│   └── <이름>.service.ts
└── types/                ← 모듈 전용 타입
    └── <이름>.types.ts
```

---

## 3. 새 모듈 만들기 — 단계별 가이드

### Step 1. 타입 정의

`src/modules/<모듈ID>/types/<모듈ID>.types.ts`

```typescript
import type { Content } from '@/types'

// Content를 확장하거나 독립 타입으로 정의
export interface MyItem extends Content {
  type: 'my_type'  // ContentType 중 하나에 매핑
  // 추가 필드
}

export interface MyListOptions {
  siteId: string
  page?: number
  pageSize?: number
  // 필터 옵션
}
```

---

### Step 2. 서비스 작성

`src/modules/<모듈ID>/services/<모듈ID>.service.ts`

```typescript
import { contentService } from '@core/content'
import type { ApiResult } from '@/types'
import type { MyItem, MyListOptions } from '../types/<모듈ID>.types'

export const myService = {
  async getItems(
    opts: MyListOptions,
  ): Promise<ApiResult<{ items: MyItem[]; total: number }>> {
    const pageSize = opts.pageSize ?? 10
    const offset = ((opts.page ?? 1) - 1) * pageSize

    const { data, error } = await contentService.getList({
      siteId: opts.siteId,
      type: 'my_type',   // 이 모듈이 사용하는 ContentType
      status: 'published',
      limit: pageSize,
      offset,
      orderBy: 'publishedAt',
    })

    if (error) return { data: null, error }
    return {
      data: {
        items: (data?.items ?? []) as MyItem[],
        total: data?.total ?? 0,
      },
      error: null,
    }
  },

  async getItemBySlug(
    siteId: string,
    slug: string,
  ): Promise<ApiResult<MyItem>> {
    const { data, error } = await contentService.getBySlug(siteId, slug)
    if (error || !data) {
      return { data: null, error: error ?? { code: 'NOT_FOUND', message: 'Item not found' } }
    }
    return { data: data as MyItem, error: null }
  },
}
```

**중요 규칙**:
- 모든 DB 접근은 `contentService`를 통해 수행 (직접 `supabase` 호출 금지)
- 서비스 메서드는 항상 `ApiResult<T>` 형태로 반환
- `siteId` 파라미터를 항상 첫 번째 또는 opts에 포함

---

### Step 3. 커스텀 훅 작성

`src/modules/<모듈ID>/hooks/use<이름>.ts`

```typescript
import { useState, useEffect } from 'react'
import { useRuntime } from '@core/runtime'
import { myService } from '../services/<모듈ID>.service'
import type { MyItem } from '../types/<모듈ID>.types'

export function useMyItems(page = 1) {
  const { site } = useRuntime()
  const [items, setItems] = useState<MyItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    myService
      .getItems({ siteId: site.siteId, page })
      .then(({ data, error }) => {
        if (error || !data) {
          setError(error?.message ?? '불러오기 실패')
          return
        }
        setItems(data.items)
        setTotal(data.total)
      })
      .finally(() => setLoading(false))
  }, [site.siteId, page])

  return { items, total, loading, error }
}
```

---

### Step 4. 페이지 컴포넌트 작성

`src/modules/<모듈ID>/components/<이름>ListPage.tsx`

```tsx
import { useMyItems } from '../hooks/use<이름>'

export function MyListPage() {
  const { items, loading, error } = useMyItems()

  if (loading) return <div>로딩 중...</div>
  if (error) return <div>오류: {error}</div>

  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  )
}
```

`src/modules/<모듈ID>/components/<이름>DetailPage.tsx`

```tsx
import { useParams } from 'react-router-dom'
import { useRuntime } from '@core/runtime'
import { myService } from '../services/<모듈ID>.service'
import { useState, useEffect } from 'react'
import type { MyItem } from '../types/<모듈ID>.types'

export function MyDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { site } = useRuntime()
  const [item, setItem] = useState<MyItem | null>(null)

  useEffect(() => {
    if (!slug) return
    myService.getItemBySlug(site.siteId, slug).then(({ data }) => {
      setItem(data)
    })
  }, [site.siteId, slug])

  if (!item) return <div>로딩 중...</div>
  return <div><h1>{item.title}</h1></div>
}
```

---

### Step 5. index.ts — 모듈 등록

`src/modules/<모듈ID>/index.ts`

```typescript
import type { RegisteredModule } from '@/app/registry/moduleRegistry'

export const myModule: RegisteredModule = {
  definition: {
    id: '<모듈ID>',                    // 고유 ID — site_settings.modules 배열에 사용
    name: '모듈 이름',
    description: '모듈 설명',
    version: '1.0.0',
    requiredFeatures: ['<featureFlag>'],  // SiteFeatureFlags의 키
  },
  routes: [
    {
      path: '<경로>',                   // 예: 'news'
      lazy: () =>
        import('./components/<이름>ListPage').then((m) => ({
          Component: m.MyListPage,
        })),
    },
    {
      path: '<경로>/:slug',
      lazy: () =>
        import('./components/<이름>DetailPage').then((m) => ({
          Component: m.MyDetailPage,
        })),
    },
  ],
}

// 필요한 항목만 re-export
export { myService } from './services/<모듈ID>.service'
export { useMyItems } from './hooks/use<이름>'
export type { MyItem, MyListOptions } from './types/<모듈ID>.types'
```

---

### Step 6. bootstrap.ts에 등록

`src/app/bootstrap.ts` 하단에 추가:

```typescript
import { myModule } from '@modules/<모듈ID>'
moduleRegistry.register('<모듈ID>', myModule)
```

---

### Step 7. 테스트 작성

`src/modules/<모듈ID>/<모듈ID>.service.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { myService } from './services/<모듈ID>.service'

// contentService mock
vi.mock('@core/content', () => ({
  contentService: {
    getList: vi.fn(),
    getBySlug: vi.fn(),
  },
}))

import { contentService } from '@core/content'

describe('myService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('정상적으로 아이템 목록을 반환한다', async () => {
    vi.mocked(contentService.getList).mockResolvedValue({
      data: { items: [{ id: '1', title: 'Test', type: 'my_type' }], total: 1 },
      error: null,
    })

    const result = await myService.getItems({ siteId: 'site-1' })
    expect(result.error).toBeNull()
    expect(result.data?.items).toHaveLength(1)
  })
})
```

---

## 4. 새 템플릿 만들기

### 폴더 구조

```
src/templates/<templateID>/
├── index.ts                    ← export 집합
├── <이름>Layout.tsx            ← 루트 레이아웃 (필수)
├── components/
│   ├── <이름>Header.tsx
│   └── <이름>Footer.tsx
└── pages/
    └── <이름>HomePage.tsx      ← 홈 페이지
```

### Layout 컴포넌트

`src/templates/<templateID>/<이름>Layout.tsx`

```tsx
import { Outlet } from 'react-router-dom'
import { MyHeader } from './components/MyHeader'
import { MyFooter } from './components/MyFooter'
import { useRuntime } from '@core/runtime'

export function MyLayout() {
  const { site } = useRuntime()

  return (
    <div className="min-h-screen flex flex-col">
      <MyHeader siteName={site.name} />
      <main className="flex-1">
        <Outlet />
      </main>
      <MyFooter />
    </div>
  )
}
```

> **필수**: 레이아웃 컴포넌트는 반드시 `<Outlet />`을 렌더링해야 합니다.
> `<Outlet />`이 없으면 하위 페이지가 표시되지 않습니다.

### index.ts

```typescript
export { MyLayout } from './<이름>Layout'
export { MyHomePage } from './pages/<이름>HomePage'
```

### bootstrap.ts에 등록

```typescript
import { MyLayout } from '@templates/<templateID>'
import { MyHomePage } from '@templates/<templateID>/pages/<이름>HomePage'

templateRegistry.register('<templateID>', MyLayout)
homeRegistry.register('<templateID>', MyHomePage)
```

---

## 5. 데이터 흐름 요약

```
컴포넌트 (Page)
    │ 사용
    ▼
커스텀 훅 (useXxx)
    │ 호출
    ▼
모듈 서비스 (xxxService)
    │ 위임
    ▼
core/content (contentService)  ← 유일한 DB 접근 게이트웨이
    │
    ▼
Supabase PostgreSQL
```

---

## 6. 중요 규칙 요약

| 규칙 | 이유 |
|------|------|
| `supabase` 직접 import 금지 (modules/ 안에서) | contentService를 통해 RLS·사이트 격리 보장 |
| `src/core/` 파일 수정 금지 | 다른 사이트에 영향 없이 독립 확장을 위해 |
| 모듈 컴포넌트에서 lazy import 사용 | 코드 스플리팅 → 초기 로딩 성능 최적화 |
| 모든 라우트는 `site.modules` 배열에 의해 동적으로 활성화 | 사이트별 기능 On/Off 보장 |
| `index.ts`에서 필요한 항목만 re-export | 불필요한 번들 사이즈 증가 방지 |

---

## 7. ContentType 확장

새 콘텐츠 타입이 필요할 경우:

1. `src/types/platform.types.ts`의 `ContentType` union에 추가:
   ```typescript
   export type ContentType = 'page' | 'post' | 'project' | 'product' | 'custom' | '<새타입>'
   ```

2. `src/app/admin/pages/ContentEditorPage.tsx`의 `TYPE_OPTIONS` 배열에 추가 (관리자에서 선택 가능하도록)

3. Supabase의 `content_type` enum에도 반영 필요:
   ```sql
   ALTER TYPE content_type ADD VALUE '<새타입>';
   ```

---

## 8. SiteFeatureFlags 확장

새 기능 플래그가 필요할 경우:

1. `src/types/platform.types.ts`의 `SiteFeatureFlags` 인터페이스에 추가:
   ```typescript
   export interface SiteFeatureFlags {
     blog: boolean
     portfolio: boolean
     contact: boolean
     booking: boolean
     ecommerce: boolean
     mediaHub: boolean
     newFeature: boolean  // 추가
   }
   ```

2. `src/core/settings/settings.service.ts`의 기본값에도 추가:
   ```typescript
   features: { ..., newFeature: false }
   ```

3. DB의 `site_settings.feature_flags` JSONB에도 반영

---

*이 문서는 플랫폼 개발자를 위한 모듈·템플릿 확장 가이드입니다.*
*신규 사이트 전체 개설 절차는 [05_new_site_guide.md](05_new_site_guide.md)를 참조하세요.*

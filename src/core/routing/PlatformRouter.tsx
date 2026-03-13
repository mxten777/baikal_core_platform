// ============================================================
// core/routing — Platform Router
//
// 책임:
//   - SiteConfig.modules 기반 동적 라우트 생성
//   - 인증 보호 라우트 (ProtectedRoute)
//   - 404 처리
//
// 의존: core/runtime (useRuntime), core/auth (useAuth)
// 비종속: 특정 template/module 컴포넌트에 직접 의존하지 않음.
//         moduleRegistry를 통해 lazy 로드한다.
// ============================================================

import { Suspense } from 'react'
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
  useLocation,
} from 'react-router-dom'
import { useRuntime } from '@core/runtime'
import { useAuth } from '@core/auth'
import { moduleRegistry } from '@/app/registry/moduleRegistry'
import { templateRegistry } from '@/app/registry/templateRegistry'
import { homeRegistry } from '@/app/registry/homeRegistry'

// ------ Loading fallback ------

function PageLoading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <span className="text-gray-400 text-sm">Loading...</span>
    </div>
  )
}

// ------ Protected Route ------

interface ProtectedRouteProps {
  requiredRole?: 'editor' | 'site_admin' | 'platform_admin'
}

export function ProtectedRoute({ requiredRole = 'editor' }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoading />
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />

  const hierarchy = ['viewer', 'editor', 'site_admin', 'platform_admin']
  const hasRole =
    hierarchy.indexOf(user.role) >= hierarchy.indexOf(requiredRole)

  if (!hasRole) return <Navigate to="/" replace />
  return <Outlet />
}

// ------ Platform Router Builder ------

/**
 * SiteConfig を元に RouterProvider を返すコンポーネント。
 * RuntimeContext は既にセットアップ済みであること。
 */
export function PlatformRouter() {
  const { site } = useRuntime()

  // 1. 템플릿 레이아웃 컴포넌트 로드
  const TemplateLayout = templateRegistry.get(site.templateId)
  if (!TemplateLayout) {
    throw new Error(`Template "${site.templateId}" not registered`)
  }

  // 2. templateId에 맞는 Home 컴포넌트 로드
  const HomeComponent = homeRegistry.get(site.templateId)

  // 3. 활성화된 모듈의 라우트 수집
  const moduleRoutes = site.modules.flatMap((moduleId) => {
    const mod = moduleRegistry.get(moduleId)
    return mod?.routes ?? []
  })

  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <Suspense fallback={<PageLoading />}>
          <TemplateLayout />
        </Suspense>
      ),
      children: [
        // 홈 페이지 (templateId에 맞는 컴포넌트)
        ...(HomeComponent
          ? [{ index: true, element: <HomeComponent /> }]
          : []),
        // 모듈 라우트 (blog, portfolio, contact 등)
        ...moduleRoutes,
        // CMS slug 기반 동적 페이지
        {
          path: ':slug',
          lazy: () =>
            import('@core/content/DynamicPage').then((m) => ({
              Component: m.DynamicPage,
            })),
        },
        // 404
        {
          path: '*',
          lazy: () =>
            import('@core/ui/NotFound').then((m) => ({
              Component: m.NotFound,
            })),
        },
      ],
    },
    {
      path: '/login',
      lazy: () =>
        import('@core/auth/LoginPage').then((m) => ({
          Component: m.LoginPage,
        })),
    },
    // Admin 라우트 (보호됨)
    {
      path: '/admin',
      element: <ProtectedRoute requiredRole="editor" />,
      children: [
        {
          // AdminLayout wraps all /admin/** child routes
          path: '',
          lazy: () =>
            import('@/app/admin/AdminLayout').then((m) => ({
              Component: m.AdminLayout,
            })),
          children: [
            {
              index: true,
              lazy: () =>
                import('@/app/admin/pages/DashboardPage').then((m) => ({
                  Component: m.DashboardPage,
                })),
            },
            // 콘텐츠 목록
            {
              path: 'content',
              lazy: () =>
                import('@/app/admin/pages/ContentListPage').then((m) => ({
                  Component: m.ContentListPage,
                })),
            },
            // 새 콘텐츠 생성
            {
              path: 'content/new',
              lazy: () =>
                import('@/app/admin/pages/ContentEditorPage').then((m) => ({
                  Component: m.ContentEditorPage,
                })),
            },
            // 콘텐츠 편집
            {
              path: 'content/:id/edit',
              lazy: () =>
                import('@/app/admin/pages/ContentEditorPage').then((m) => ({
                  Component: m.ContentEditorPage,
                })),
            },
            // 폼 제출 목록
            {
              path: 'submissions',
              lazy: () =>
                import('@/app/admin/pages/FormSubmissionsPage').then((m) => ({
                  Component: m.FormSubmissionsPage,
                })),
            },
            // 미디어 라이브러리 (Step 11에서 구현)
            {
              path: 'media',
              lazy: () =>
                import('@/app/admin/pages/MediaPage').then((m) => ({
                  Component: m.MediaPage,
                })),
            },
          ],
        },
      ],
    },
  ])

  return <RouterProvider router={router} />
}

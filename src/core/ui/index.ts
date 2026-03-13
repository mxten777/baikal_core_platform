// ============================================================
// core/ui — Platform UI Primitives
//
// 책임:
//   - site/template에 **비종속적인** 기본 UI 컴포넌트
//   - 플랫폼 레벨 공통 컴포넌트 (NotFound, ErrorBoundary 등)
//
// 규칙:
//   - 이 컴포넌트는 어떤 사이트에서도 동일하게 보여야 한다.
//   - TailwindCSS 클래스는 최소화 (스타일은 template에서 결정)
// ============================================================

// ------ NotFound ------
export { NotFound } from './NotFound'

// ------ ErrorBoundary ------
export { ErrorBoundary } from './ErrorBoundary'

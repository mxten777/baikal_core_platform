// ============================================================
// app/registry/templateRegistry
//
// 책임:
//   - 모든 Template Layout 컴포넌트를 등록/조회
//   - SiteConfig.templateId를 해석하여 레이아웃 반환
//
// 규칙:
//   - templateId는 site.config.ts에 정의된 값과 일치해야 함
// ============================================================

import type { ComponentType } from 'react'

export class TemplateRegistry {
  private store = new Map<string, ComponentType>()

  register(id: string, Layout: ComponentType) {
    if (this.store.has(id)) {
      console.warn(`[TemplateRegistry] Template "${id}" is already registered.`)
      return
    }
    this.store.set(id, Layout)
  }

  get(id: string): ComponentType | undefined {
    return this.store.get(id)
  }

  has(id: string): boolean {
    return this.store.has(id)
  }
}

export const templateRegistry = new TemplateRegistry()

// ============================================================
// app/registry/homeRegistry.ts
//
// 책임: templateId → Home 컴포넌트 매핑
// 규칙: 각 template은 자신의 Home 페이지를 여기에 등록해야 한다.
// ============================================================

import type { ComponentType } from 'react'

class HomeRegistry {
  private store = new Map<string, ComponentType>()

  register(templateId: string, Home: ComponentType) {
    this.store.set(templateId, Home)
  }

  get(templateId: string): ComponentType | undefined {
    return this.store.get(templateId)
  }
}

export const homeRegistry = new HomeRegistry()

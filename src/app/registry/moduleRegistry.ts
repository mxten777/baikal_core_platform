// ============================================================
// app/registry/moduleRegistry
//
// 책임:
//   - 모든 Module의 라우트와 정의를 등록/조회
//   - SiteConfig.modules 배열에 명시된 moduleId를 해석
//
// 규칙:
//   - 모든 모듈은 이 registry에 등록되어야만 사용 가능
//   - lazy import 사용으로 번들 분할
// ============================================================

import type { RouteObject } from 'react-router-dom'
import type { ModuleDefinition } from '@/types'

export interface RegisteredModule {
  definition: ModuleDefinition
  routes: RouteObject[]
}

export class ModuleRegistry {
  private store = new Map<string, RegisteredModule>()

  register(id: string, module: RegisteredModule) {
    if (this.store.has(id)) {
      console.warn(`[ModuleRegistry] Module "${id}" is already registered.`)
      return
    }
    this.store.set(id, module)
  }

  get(id: string): RegisteredModule | undefined {
    return this.store.get(id)
  }

  getAll(): RegisteredModule[] {
    return Array.from(this.store.values())
  }

  has(id: string): boolean {
    return this.store.has(id)
  }
}

export const moduleRegistry = new ModuleRegistry()

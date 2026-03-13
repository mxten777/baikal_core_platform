// ============================================================
// app/registry — Registry 단위 테스트
// ============================================================

import { describe, it, expect } from 'vitest'
import { moduleRegistry } from '@/app/registry/moduleRegistry'
import { templateRegistry } from '@/app/registry/templateRegistry'

describe('moduleRegistry', () => {
  it('등록된 모듈을 get으로 조회할 수 있다', () => {
    const fakeModule = {
      definition: {
        id: 'test-blog',
        name: 'Test Blog',
        description: '',
        version: '1.0.0',
        requiredFeatures: ['blog' as const],
      },
      routes: [],
    }
    moduleRegistry.register('test-blog', fakeModule)
    expect(moduleRegistry.get('test-blog')).toBe(fakeModule)
  })

  it('등록되지 않은 모듈은 undefined를 반환한다', () => {
    expect(moduleRegistry.get('non-existent')).toBeUndefined()
  })

  it('has() 메서드가 정확하게 작동한다', () => {
    expect(moduleRegistry.has('test-blog')).toBe(true)
    expect(moduleRegistry.has('non-existent')).toBe(false)
  })
})

describe('templateRegistry', () => {
  it('등록된 template을 get으로 조회할 수 있다', () => {
    const FakeLayout = () => null
    templateRegistry.register('test-corporate', FakeLayout)
    expect(templateRegistry.get('test-corporate')).toBe(FakeLayout)
  })

  it('등록되지 않은 template은 undefined를 반환한다', () => {
    expect(templateRegistry.get('unknown-template')).toBeUndefined()
  })
})

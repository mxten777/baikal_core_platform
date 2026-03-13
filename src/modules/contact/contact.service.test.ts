// ============================================================
// modules/contact — contactService sanitize 단위 테스트
//
// XSS 방지 sanitize 로직을 Supabase mock을 통해 검증.
// ============================================================

import { describe, it, expect, vi } from 'vitest'

// Supabase insert에 전달된 데이터를 캡처하기 위한 mock
const insertedRows: Array<{ data: Record<string, string> }> = []
vi.mock('@lib/supabase', () => ({
  supabase: {
    from: () => ({
      insert: (row: { data: Record<string, string> }) => {
        insertedRows.push(row)
        return Promise.resolve({ error: null })
      },
    }),
  },
}))

// mock 설정 후 import
import { contactService } from '@modules/contact/services/contact.service'

describe('contactService.submit', () => {
  it('결과 에러 없이 제출 성공', async () => {
    const result = await contactService.submit({
      formId: 'form-1',
      siteId: 'site-1',
      data: { name: 'Alice', message: 'Hello' },
    })
    expect(result.error).toBeNull()
  })

  it('XSS 스크립트 태그가 제거된 데이터가 저장된다', async () => {
    insertedRows.length = 0

    await contactService.submit({
      formId: 'form-1',
      siteId: 'site-1',
      data: {
        name: '<script>alert("xss")</script>Bob',
        message: 'Hi <img src=x onerror=alert(1)>',
      },
    })

    expect(insertedRows.length).toBeGreaterThan(0)
    const saved = insertedRows[insertedRows.length - 1].data
    // HTML 태그 제거 확인
    expect(saved.name).not.toContain('<script>')
    expect(saved.name).toContain('Bob')
    expect(saved.message).not.toContain('<img')
  })

  it('key에 허용되지 않은 문자가 제거된다', async () => {
    insertedRows.length = 0

    await contactService.submit({
      formId: 'form-1',
      siteId: 'site-1',
      data: {
        'bad key!@#': 'value',
      },
    })

    const saved = insertedRows[insertedRows.length - 1].data
    // 특수문자 key가 sanitize되어 알파뉴메릭+하이픈+언더스코어만 남음
    const keys = Object.keys(saved)
    keys.forEach((k) => {
      expect(k).toMatch(/^[a-zA-Z0-9_-]*$/)
    })
  })

  it('정상 데이터는 내용이 보존된다', async () => {
    insertedRows.length = 0

    await contactService.submit({
      formId: 'form-1',
      siteId: 'site-1',
      data: {
        name: 'John Doe',
        email: 'john@example.com',
      },
    })

    const saved = insertedRows[insertedRows.length - 1].data
    expect(saved.name).toBe('John Doe')
    expect(saved.email).toBe('john@example.com')
  })
})


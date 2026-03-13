// ============================================================
// modules/contact — ContactForm Component
//
// 책임: 동적 폼 렌더링 + 제출 처리
// 보안: 클라이언트 validation + 서버 측 sanitize (contact.service)
// ============================================================

import { useEffect, useState } from 'react'
import { useRuntime } from '@core/runtime'
import { contactService } from '../services/contact.service'
import type { ContactForm, FormField } from '../types/contact.types'

export function ContactPage() {
  const { site } = useRuntime()
  const [form, setForm] = useState<ContactForm | null>(null)
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    contactService.getForm(site.siteId).then(({ data }) => {
      if (data) {
        setForm(data)
        // 초기값 세팅
        const init: Record<string, string> = {}
        data.schema.forEach((f) => { init[f.name] = '' })
        setValues(init)
      }
      setLoading(false)
    })
  }, [site.siteId])

  function validate(): boolean {
    if (!form) return false
    const newErrors: Record<string, string> = {}
    form.schema.forEach((field: FormField) => {
      if (field.required && !values[field.name]?.trim()) {
        newErrors[field.name] = `${field.label}을(를) 입력해주세요.`
      }
      if (field.type === 'email' && values[field.name]) {
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRe.test(values[field.name])) {
          newErrors[field.name] = '올바른 이메일 주소를 입력해주세요.'
        }
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form || !validate()) return

    setStatus('sending')
    const { error } = await contactService.submit({
      formId: form.id,
      siteId: site.siteId,
      data: values,
    })

    setStatus(error ? 'error' : 'done')
  }

  if (loading) return <div className="p-8 text-gray-400">불러오는 중...</div>
  if (!form) return <div className="p-8 text-gray-400">문의 폼을 찾을 수 없습니다.</div>

  if (status === 'done') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-green-600 font-medium text-lg">
          문의가 접수되었습니다. 곧 연락드리겠습니다.
        </p>
      </div>
    )
  }

  return (
    <section className="max-w-lg mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">문의하기</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {form.schema.map((field: FormField) => (
          <div key={field.name} className="flex flex-col gap-1">
            <label htmlFor={field.name} className="text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>

            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                value={values[field.name] ?? ''}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [field.name]: e.target.value }))
                }
                rows={5}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            ) : (
              <input
                id={field.name}
                type={field.type}
                name={field.name}
                value={values[field.name] ?? ''}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [field.name]: e.target.value }))
                }
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}

            {errors[field.name] && (
              <p className="text-xs text-red-500">{errors[field.name]}</p>
            )}
          </div>
        ))}

        {status === 'error' && (
          <p className="text-sm text-red-500">전송에 실패했습니다. 잠시 후 다시 시도해주세요.</p>
        )}

        <button
          type="submit"
          disabled={status === 'sending'}
          className="mt-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {status === 'sending' ? '전송 중...' : '문의 보내기'}
        </button>
      </form>
    </section>
  )
}

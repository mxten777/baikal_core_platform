export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select'
  required: boolean
  options?: string[]    // select 타입 전용
}

export interface ContactForm {
  id: string
  siteId: string
  name: string
  slug: string
  schema: FormField[]
  emailTo: string[]
  active: boolean
}

export interface FormSubmission {
  formId: string
  siteId: string
  data: Record<string, string>
}

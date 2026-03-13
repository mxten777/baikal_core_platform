import type { RegisteredModule } from '@/app/registry/moduleRegistry'

export const contactModule: RegisteredModule = {
  definition: {
    id: 'contact',
    name: '문의하기',
    description: '동적 폼 기반 문의 수신',
    version: '1.0.0',
    requiredFeatures: ['contact'],
  },
  routes: [
    {
      path: 'contact',
      lazy: () =>
        import('./components/ContactPage').then((m) => ({
          Component: m.ContactPage,
        })),
    },
  ],
}

export { contactService } from './services/contact.service'
export type { ContactForm, FormSubmission, FormField } from './types/contact.types'

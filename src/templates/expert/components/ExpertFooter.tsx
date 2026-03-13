import type { SiteConfig } from '@/types'

interface Props {
  site: SiteConfig
}

export function ExpertFooter({ site }: Props) {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-2">
        <span className="text-xs tracking-widest uppercase text-gray-500">
          {site.name}
        </span>
        <span className="text-xs text-gray-600">© {year}</span>
      </div>
    </footer>
  )
}

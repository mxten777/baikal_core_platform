import type { SiteConfig } from '@/types'

interface Props {
  site: SiteConfig
}

export function CorporateFooter({ site }: Props) {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm font-semibold text-gray-700">{site.name}</span>
          <p className="text-xs text-gray-400">
            © {year} {site.name}. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
            Powered by BAIKAL Core Platform
          </p>
        </div>
      </div>
    </footer>
  )
}

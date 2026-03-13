import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { RuntimeProvider } from '@core/runtime'
import { PlatformRouter } from '@core/routing'
import { ErrorBoundary } from '@core/ui'
import '@/app/bootstrap'          // registry 초기화
import '@/styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <RuntimeProvider>
          <PlatformRouter />
        </RuntimeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

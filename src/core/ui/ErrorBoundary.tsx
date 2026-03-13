import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 운영환경에서는 Sentry 등 외부 로깅으로 교체
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2">
            <p className="text-red-500 font-medium">오류가 발생했습니다.</p>
            <p className="text-gray-400 text-sm">{this.state.message}</p>
          </div>
        )
      )
    }
    return this.props.children
  }
}

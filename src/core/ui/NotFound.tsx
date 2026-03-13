export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-6xl font-bold text-gray-200">404</h1>
      <p className="text-gray-500">페이지를 찾을 수 없습니다.</p>
      <a href="/" className="text-blue-500 hover:underline text-sm">
        홈으로 돌아가기
      </a>
    </div>
  )
}

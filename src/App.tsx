import { Button } from "@/components/ui/button"

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-slate-50">
      {/* 1. 테일윈드 확인: 글자가 파란색이고 굵어야 함 */}
      <h1 className="text-4xl font-extrabold text-blue-600 tracking-tight">
        링링(Link-Ring) 프로젝트 시작! 💍
      </h1>
      
      <p className="text-lg text-slate-600">
       시작!
      </p>

      {/* 2. 섀드씨엔 확인: 버튼이 둥글고 예쁜 Slate 색상이어야 함 */}
      <div className="flex gap-4">
        <Button variant="default" size="lg">
          기본 버튼
        </Button>
        <Button variant="outline" size="lg">
          라인 버튼
        </Button>
        <Button variant="destructive" size="lg">
          삭제 버튼
        </Button>
      </div>
    </div>
  )
}

export default App
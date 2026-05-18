import Header from "@/components/Header"
import { Footer } from "@/components/Footer"

export default function MyBell() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF5F7]">
      <Header myBellActive />
      <main className="container mx-auto flex flex-1 flex-col items-center justify-center px-4 py-20">
        <div className="max-w-md space-y-3 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-rose-400/90">
            My Bell
          </p>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            마이벨
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            나만의 링크를 모아두는 개인화 공간이에요. 곧 더 많은 기능이
            추가될 예정입니다.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

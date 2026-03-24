import Header from "@/components/Header"
import { Container } from "@/components/Container"

export default function Main() {

  return (
    <div className="min-h-screen bg-[#FAF5F7]">
      {/* 고정 헤더 */}
      <Header />
      <Container></Container>
    </div>
  )
}
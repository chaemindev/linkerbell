import { useEffect } from "react"
import Header from "@/components/Header"
import { Container } from "@/components/Container"
import { Footer } from "@/components/Footer"
import { subscribeLinkDataRealtime } from "@/lib/subscribeLinkDataRealtime"

export default function Main() {
  useEffect(() => subscribeLinkDataRealtime(), [])

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF5F7]">
      <Header />
      <div className="flex flex-1 flex-col">
        <Container />
        <Footer />
      </div>
    </div>
  )
}
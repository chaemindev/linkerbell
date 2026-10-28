import { useEffect, useState } from "react"
import { BirthdayConfetti } from "@/components/BirthdayConfetti"
import { BirthdayGreeting } from "@/components/BirthdayGreeting"
import { BirthdayBackground } from "@/components/BirthdayBackground"
import { getSeoulDateKey, hasBirthdayOn } from "@/lib/birthday"
import { supabase } from "@/lib/supabase"
import { useBirthdayStore } from "@/store/useBirthdayStore"

export function BirthdayCelebration() {
  const [celebration, setCelebration] = useState<{ date: string; names: string[] } | null>(null)

  useEffect(() => {
    let disposed = false
    let requestId = 0
    let lastDate = getSeoulDateKey()
    let rows: { name: string; birthday: string; status: string | null }[] = []

    const updateCelebration = () => {
      lastDate = getSeoulDateKey()
      const names = rows.filter((row) => hasBirthdayOn([row], lastDate)).map((row) => row.name)
      useBirthdayStore.getState().setBirthdayToday(names.length > 0)
      setCelebration(names.length > 0 ? { date: lastDate, names } : null)
    }

    const refresh = async () => {
      const id = ++requestId
      const { data, error } = await supabase
        .from("birthdays")
        .select("name, birthday, status")
        .or("status.is.null,status.neq.D")
      if (disposed || id !== requestId) return
      if (error) {
        console.error("[birthdays] 조회 실패:", error.message)
        return
      }
      rows = data ?? []
      updateCelebration()
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        updateCelebration()
        void refresh()
      }
    }

    void refresh()
    const channel = supabase
      .channel("linkring-birthdays")
      .on("postgres_changes", { event: "*", schema: "public", table: "birthdays" }, () => {
        void refresh()
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") void refresh()
      })
    const timer = window.setInterval(() => {
      if (getSeoulDateKey() !== lastDate) {
        updateCelebration()
        void refresh()
      }
    }, 1000)
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      disposed = true
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", onVisible)
      void supabase.removeChannel(channel)
    }
  }, [])

  return celebration ? (
    <>
      <BirthdayBackground key={`background-${celebration.date}`} />
      <BirthdayConfetti key={`confetti-${celebration.date}`} active />
      <BirthdayGreeting key={`greeting-${celebration.date}`} names={celebration.names} />
    </>
  ) : null
}

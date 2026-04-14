import { supabase } from "@/lib/supabase"
import { useLinkStore } from "@/store/useLinkStore"

const DEBOUNCE_MS = 200

function createDebouncer(run: () => void) {
  let timer: ReturnType<typeof setTimeout> | null = null
  return () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      run()
    }, DEBOUNCE_MS)
  }
}

/**
 * `categories` / `links` / `featuredlinks` 변경 시 목록을 다시 불러옵니다.
 * Supabase Dashboard → Database → Replication 에서 위 테이블 Realtime을 켜거나
 * `supabase-realtime.sql` 을 실행해야 동작합니다.
 */
export function subscribeLinkDataRealtime(): () => void {
  const scheduleCategories = createDebouncer(() => {
    void useLinkStore.getState().fetchCategories()
  })
  const scheduleFeatured = createDebouncer(() => {
    void useLinkStore.getState().fetchFeaturedLinks()
  })

  const channel = supabase
    .channel("linkring-public-data")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "categories" },
      scheduleCategories,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "links" },
      scheduleCategories,
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "featuredlinks" },
      scheduleFeatured,
    )
    .subscribe((status, err) => {
      if (status === "SUBSCRIBED") return
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.warn("[subscribeLinkDataRealtime]", status, err?.message ?? err)
      }
    })

  return () => {
    void supabase.removeChannel(channel)
  }
}

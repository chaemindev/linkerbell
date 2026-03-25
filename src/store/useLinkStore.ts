// src/store/useLinkStore.ts
import { create } from "zustand"
import { supabase } from "@/lib/supabase"

/** DB int8(bigint) — PostgREST/JSON은 숫자 또는 문자열로 줄 수 있어 앱에서는 number로 통일 */
function toInt8Id(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

interface Link {
  id: number
  title: string
  url: string
  category_id: number
}

interface Category {
  id: number
  name: string
  links: Link[]
}

interface LinkStore {
  categories: Category[]
  fetchCategories: () => Promise<void>
  addLink: (categoryId: number, title: string, url: string) => Promise<void>
  deleteLink: (linkId: number) => Promise<void>
  addCategory: (name: string) => Promise<void>
}

export const useLinkStore = create<LinkStore>((set) => ({
  categories: [],
  
  // 🔥 서버에서 데이터 불러오기
  fetchCategories: async () => {
    // categories + links relation으로 한 번에 조회 (links 테이블 FK: category_id → categories.id)
    const { data, error } = await supabase
      .from('categories')
      .select('*, links(*)')
      .order('id', { ascending: true })

    if (error) {
      console.error('[fetchCategories] 에러:', error.message)
      return
    }

    const rows = (data ?? []) as Record<string, unknown>[]
    if (rows.length === 0) {
      console.warn('[fetchCategories] 데이터 없음. Supabase RLS 정책 확인 → supabase-rls.sql 참고')
      set({ categories: [] })
      return
    }

    const categories: Category[] = rows.map((row) => {
      const rawLinks = (row.links ?? []) as Record<string, unknown>[]
      const links: Link[] = rawLinks.map((link) => ({
        id: toInt8Id(link.id),
        title: (link.page_title ?? link.title ?? "") as string,
        url: (link.page_url ?? link.url ?? "") as string,
        category_id: toInt8Id(link.category_id ?? link.categoryId ?? row.id),
      }))
      return {
        id: toInt8Id(row.id),
        name: (row.category_name ?? row.name ?? row.categoryName ?? '미분류') as string,
        links,
      }
    })
    set({ categories })
  },

  // 🔥 서버에 새 링크 저장하기
  addLink: async (category_id: number, title: string, url: string) => {
    const { error } = await supabase
      .from('links')
      .insert([{ category_id, page_title: title, page_url: url }])

    if (error) {
      console.error('[addLink] 저장 실패:', error.message, error.details)
      alert(`저장 실패: ${error.message}\n→ Supabase links 테이블 RLS INSERT 정책 확인`)
      return
    }

    // 저장 성공 시 목록 새로고침
    const { fetchCategories } = useLinkStore.getState()
    await fetchCategories()
  },

  deleteLink: async (linkId: number) => {

    const {error} = await supabase
    .from("links").delete().eq("id", linkId).select("id")


    if (error) {
      console.error("[deleteLink] 삭제 실패:", error.message)
      alert(`삭제 실패: ${error.message}\n`)
      return
    }

    const { fetchCategories } = useLinkStore.getState()
    await fetchCategories()

    // PostgREST는 삭제된 행이 0개여도 error가 없을 수 있음(RLS 등). 목록에 남아 있으면 실패로 안내.
    const stillThere = useLinkStore
      .getState()
      .categories.some((c) => c.links.some((l) => l.id === linkId))

    if (stillThere) {
      alert(
        "삭제 요청은 갔지만 DB에서 행이 지워지지 않았어요.\n" +
          "Supabase → Authentication 없이 쓰는 경우 links 테이블에 DELETE용 RLS 정책이 있는지 확인하세요.\n" +
          "(프로젝트의 supabase-rls.sql 의 Allow public delete links 실행 여부)",
      )
    }
  },

  // 새 카테고리 추가
  addCategory: async (name: string) => {
    const { error } = await supabase
      .from("categories")
      .insert([{ category_name: name }])

    if (error) {
      console.error("[addCategory] 저장 실패:", error.message)
      alert(`카테고리 저장 실패: ${error.message}\n→ Supabase categories 테이블 RLS INSERT 정책 확인`)
      return
    }

    const { fetchCategories } = useLinkStore.getState()
    await fetchCategories()
  },
}))
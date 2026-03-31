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

function toSortOrder(value: unknown): number {
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
  /** 카테고리 내 수동 정렬 (낮을수록 위) */
  sort_order: number
}

interface Category {
  id: number
  name: string
  /** 카테고리 수동 정렬 (낮을수록 앞) */
  sort_order: number
  links: Link[]
}

interface FeaturedLinks {
  id: number
  title: string
  url: string
  /** `public/favicon/favicon_{key}.png` 또는 `.ico` */
  faviconKey: string
}

interface LinkStore {
  categories: Category[]
  featuredLinks: FeaturedLinks[]

  fetchCategories: () => Promise<void>
  fetchFeaturedLinks: () => Promise<void>
  addFeaturedLink: (title: string, url: string, faviconKey?: string) => Promise<boolean>
  addLink: (categoryId: number, title: string, url: string) => Promise<void>
  updateLink: (
    linkId: number,
    updates: { title?: string; url?: string },
  ) => Promise<boolean>
  deleteLink: (linkId: number) => Promise<void>
  reorderLinks: (categoryId: number, orderedLinkIds: number[]) => Promise<void>
  reorderCategories: (orderedCategoryIds: number[]) => Promise<void>
  addCategory: (name: string) => Promise<void>
  renameCategory: (categoryId: number, name: string) => Promise<boolean>
  deleteCategory: (categoryId: number) => Promise<void>
}

export const useLinkStore = create<LinkStore>((set, get) => ({
  categories: [],
  
  // 🔥 서버에서 데이터 불러오기
  fetchCategories: async () => {
    // categories + links relation으로 한 번에 조회 (links 테이블 FK: category_id → categories.id)
    const { data, error } = await supabase
      .from('categories')
      .select('*, links(*)')
      .order('sort_order', { ascending: true })
      .order('sort_order', { ascending: true, foreignTable: 'links' })

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
        sort_order: toSortOrder(link.sort_order ?? link.sortOrder),
      }))
      links.sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
      return {
        id: toInt8Id(row.id),
        name: (row.category_name ?? row.name ?? row.categoryName ?? '미분류') as string,
        sort_order: toSortOrder(row.sort_order ?? row.sortOrder),
        links,
      }
    })
    set({ categories })
  },

  featuredLinks: [],

  fetchFeaturedLinks: async () => {
    
    const { data, error } = await supabase
      .from('featuredlinks')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      console.error('[fetchFeaturedLinks] 에러:', error.message)
      return
    }

    const rows = (data ?? []) as Record<string, unknown>[]
    if (rows.length === 0) {
      console.warn('[fetchFeaturedLinks] 데이터 없음. Supabase RLS 정책 확인 → supabase-rls.sql 참고')
      set({ featuredLinks: [] })
      return
    }

    const featuredLinks: FeaturedLinks[] = rows.map((row) => ({
      id: toInt8Id(row.id),
      title: ((row.page_title ?? row.title ?? "") as string) || "",
      url: ((row.page_url ?? row.url ?? "") as string) || "",
      faviconKey: ((row.favicon_key ?? row.faviconKey ?? "") as string) || "",
    }))
    set({ featuredLinks })
  },

  addFeaturedLink: async (title: string, url: string, faviconKey?: string) => {
    const t = title.trim()
    const raw = url.trim()
    if (!t || !raw) {
      alert("제목과 URL을 입력해 주세요.")
      return false
    }
    const u = raw.startsWith("http") ? raw : `https://${raw}`
    if (get().featuredLinks.length >= 10) {
      alert("스포트라이트는 최대 10개까지 추가할 수 있습니다.")
      return false
    }
    const key = (faviconKey?.trim() ?? "").trim()
    const { error } = await supabase.from("featuredlinks").insert([
      {
        page_title: t,
        page_url: u,
        favicon_key: key,
      },
    ])
    if (error) {
      console.error("[addFeaturedLink] 저장 실패:", error.message, error.details)
      const dupPkey =
        error.code === "23505" ||
        (error.message ?? "").toLowerCase().includes("duplicate key")
      if (dupPkey) {
        alert(
          "저장 실패: id 시퀀스가 테이블과 맞지 않을 수 있습니다.\n\n" +
            "Supabase SQL Editor에서 아래를 실행한 뒤 다시 시도하세요:\n\n" +
            "SELECT setval(\n" +
            "  pg_get_serial_sequence('public.featuredlinks','id'),\n" +
            "  COALESCE((SELECT MAX(id) FROM public.featuredlinks), 1)\n" +
            ");",
        )
      } else {
        alert(`저장 실패: ${error.message}\n→ Supabase featuredlinks 테이블·RLS·컬럼명 확인`)
      }
      return false
    }
    await get().fetchFeaturedLinks()
    return true
  },

  // 🔥 서버에 새 링크 저장하기
  addLink: async (category_id: number, title: string, url: string) => {
    const { data: maxRows } = await supabase
      .from('links')
      .select('sort_order')
      .eq('category_id', category_id)
      .order('sort_order', { ascending: false })
      .limit(1)

    const maxOrder = maxRows?.[0] ? toSortOrder((maxRows[0] as { sort_order?: unknown }).sort_order) : -1
    const nextOrder = maxOrder + 1

    const { error } = await supabase
      .from('links')
      .insert([{ category_id, page_title: title, page_url: url, sort_order: nextOrder }])

    if (error) {
      console.error('[addLink] 저장 실패:', error.message, error.details)
      alert(`저장 실패: ${error.message}\n→ Supabase links 테이블 RLS INSERT 정책 확인`)
      return
    }

    // 저장 성공 시 목록 새로고침
    const { fetchCategories } = useLinkStore.getState()
    await fetchCategories()
  },

  updateLink: async (linkId: number, updates: { title?: string; url?: string }) => {
    const patch: Record<string, string> = {}
    if (updates.title !== undefined) {
      const t = updates.title.trim()
      if (!t) return false
      patch.page_title = t
    }
    if (updates.url !== undefined) {
      const u = updates.url.trim()
      if (!u) return false
      patch.page_url = u.startsWith("http") ? u : `https://${u}`
    }
    if (Object.keys(patch).length === 0) return false

    const { error } = await supabase.from("links").update(patch).eq("id", linkId)

    if (error) {
      console.error("[updateLink] 수정 실패:", error.message)
      alert(`링크 수정 실패: ${error.message}\n→ links 테이블 RLS UPDATE 확인`)
      return false
    }

    await useLinkStore.getState().fetchCategories()
    return true
  },

  reorderLinks: async (categoryId: number, orderedLinkIds: number[]) => {
    const prev = get().categories.map((cat) => ({
      ...cat,
      links: cat.links.map((l) => ({ ...l })),
    }))

    const category = get().categories.find((c) => c.id === categoryId)
    if (!category) return

    const byId = new Map(category.links.map((l) => [l.id, l]))
    const newLinks = orderedLinkIds
      .map((id, index) => {
        const link = byId.get(id)
        if (!link) return null
        return { ...link, sort_order: index }
      })
      .filter((l): l is Link => l != null)

    if (newLinks.length !== category.links.length) {
      console.warn("[reorderLinks] id 목록이 현재 링크와 맞지 않아 건너뜀")
      return
    }

    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === categoryId ? { ...c, links: newLinks } : c,
      ),
    }))

    const results = await Promise.all(
      orderedLinkIds.map((id, index) =>
        supabase.from("links").update({ sort_order: index }).eq("id", id).eq("category_id", categoryId),
      ),
    )
    const failed = results.find((r) => r.error)
    if (failed?.error) {
      console.error("[reorderLinks] 실패:", failed.error.message)
      alert(`순서 저장 실패: ${failed.error.message}\n→ links.sort_order 컬럼·RLS UPDATE 확인`)
      set({ categories: prev })
      await get().fetchCategories()
      return
    }
  },

  reorderCategories: async (orderedCategoryIds: number[]) => {
    const prev = get().categories.map((cat) => ({
      ...cat,
      links: cat.links.map((l) => ({ ...l })),
    }))

    const byId = new Map(get().categories.map((c) => [c.id, c]))
    const nextCategories = orderedCategoryIds
      .map((id) => byId.get(id))
      .filter((c): c is Category => c != null)

    if (
      nextCategories.length !== get().categories.length ||
      nextCategories.length !== orderedCategoryIds.length
    ) {
      console.warn("[reorderCategories] id 목록이 현재 카테고리와 맞지 않아 건너뜀")
      return
    }

    set((state) => ({
      categories: orderedCategoryIds
        .map((id) => state.categories.find((c) => c.id === id))
        .filter((c): c is Category => c != null)
        .map((c, index) => ({ ...c, sort_order: index })),
    }))

    const results = await Promise.all(
      orderedCategoryIds.map((id, index) =>
        supabase.from("categories").update({ sort_order: index }).eq("id", id),
      ),
    )
    const failed = results.find((r) => r.error)
    if (failed?.error) {
      console.error("[reorderCategories] 실패:", failed.error.message)
      alert(`카테고리 순서 저장 실패: ${failed.error.message}\n→ categories.sort_order 컬럼·RLS UPDATE 확인`)
      set({ categories: prev })
      await get().fetchCategories()
    }
  },

  deleteLink: async (linkId: number) => {
    const { error } = await supabase.from("links").delete().eq("id", linkId)

    if (error) {
      console.error("[deleteLink] 삭제 실패:", error.message)
      alert(`삭제 실패: ${error.message}`)
      return
    }

    await useLinkStore.getState().fetchCategories()
  },

  // 새 카테고리 추가
  addCategory: async (name: string) => {
    const { data: maxRows } = await supabase
      .from("categories")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)

    const maxOrder = maxRows?.[0]
      ? toSortOrder((maxRows[0] as { sort_order?: unknown }).sort_order)
      : -1
    const nextOrder = maxOrder + 1

    const { error } = await supabase
      .from("categories")
      .insert([{ category_name: name, sort_order: nextOrder }])

    if (error) {
      console.error("[addCategory] 저장 실패:", error.message)
      alert(`카테고리 저장 실패: ${error.message}\n→ Supabase categories 테이블 RLS INSERT 정책 확인`)
      return
    }

    const { fetchCategories } = useLinkStore.getState()
    await fetchCategories()
  },

  renameCategory: async (categoryId: number, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return false

    const { error } = await supabase
      .from("categories")
      .update({ category_name: trimmed })
      .eq("id", categoryId)

    if (error) {
      console.error("[renameCategory] 수정 실패:", error.message)
      alert(`이름 수정 실패: ${error.message}\n→ categories 테이블 RLS UPDATE 확인`)
      return false
    }

    await useLinkStore.getState().fetchCategories()
    return true
  },

  deleteCategory: async (categoryId: number) => {
    const { error: linksError } = await supabase
      .from("links")
      .delete()
      .eq("category_id", categoryId)

    if (linksError) {
      console.error("[deleteCategory] 링크 삭제 실패:", linksError.message)
      alert(`링크 삭제 실패: ${linksError.message}`)
      return
    }

    const { error: categoryError } = await supabase.from("categories").delete().eq("id", categoryId)

    if (categoryError) {
      console.error("[deleteCategory] 카테고리 삭제 실패:", categoryError.message)
      alert(`카테고리 삭제 실패: ${categoryError.message}`)
      return
    }

    await useLinkStore.getState().fetchCategories()
  },
}))
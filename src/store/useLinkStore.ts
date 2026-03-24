// src/store/useLinkStore.ts
import { create } from "zustand"
import { supabase } from "@/lib/supabase"

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
        id: (link.id ?? 0) as number,
        title: (link.page_title ?? link.title ?? '') as string,
        url: (link.page_url ?? link.url ?? '') as string,
        category_id: (link.category_id ?? link.categoryId ?? row.id) as number,
      }))
      return {
        id: row.id as number,
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
import { create } from "zustand"

export interface MyBellLink {
  id: number
  title: string
  url: string
  categoryId: number
  clickCount: number
  savedAt: number
  /** 링크 카드 배경색 — null이면 기본 */
  colorKey?: string | null
}

export interface MyBellCategory {
  id: number
  name: string
}

interface PersistedData {
  userName: string
  categories: MyBellCategory[]
  links: MyBellLink[]
}

interface MyBellStore extends PersistedData {
  setUserName: (name: string) => void
  addCategory: (name: string) => void
  deleteCategory: (id: number) => void
  renameCategory: (id: number, name: string) => void
  reorderCategories: (orderedIds: number[]) => void
  addLink: (categoryId: number, title: string, url: string) => void
  reorderLinks: (categoryId: number, orderedIds: number[]) => void
  updateLink: (id: number, updates: { title?: string; url?: string; colorKey?: string | null }) => void
  deleteLink: (id: number) => void
  recordClick: (id: number) => void
}

const STORAGE_KEY = "mybell-storage"

/** 동기 로드 — persist 미들웨어의 async hydration 없이 즉시 초기화 */
function load(): PersistedData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { userName: "나", categories: [], links: [] }
    const parsed = JSON.parse(raw) as Record<string, unknown>
    // persist 미들웨어 구버전 포맷 ({state: {...}}) 과 신버전 flat 포맷 모두 지원
    const data = (parsed.state as Partial<PersistedData>) ?? (parsed as Partial<PersistedData>)
    return {
      userName: typeof data.userName === "string" ? data.userName : "나",
      categories: Array.isArray(data.categories) ? (data.categories as MyBellCategory[]) : [],
      links: Array.isArray(data.links) ? (data.links as MyBellLink[]) : [],
    }
  } catch {
    return { userName: "나", categories: [], links: [] }
  }
}

/** 동기 저장 — 순수 데이터만 직렬화해 localStorage에 즉시 반영 */
function save(userName: string, categories: MyBellCategory[], links: MyBellLink[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ userName, categories, links }))
  } catch (e) {
    console.warn("[useMyBellStore] localStorage 저장 실패:", e)
  }
}

// Date.now() 밀리초 충돌 방지
let _seq = 0
const uniqueId = () => Date.now() * 10000 + (_seq++ % 10000)

// 모듈 로드 시점에 동기적으로 초기 데이터 읽기
const initial = load()

export const useMyBellStore = create<MyBellStore>()((set) => ({
  ...initial,

  setUserName: (name) =>
    set((s) => {
      const userName = name.trim() || "나"
      save(userName, s.categories, s.links)
      return { userName }
    }),

  addCategory: (name) =>
    set((s) => {
      const categories = [...s.categories, { id: uniqueId(), name }]
      save(s.userName, categories, s.links)
      return { categories }
    }),

  deleteCategory: (id) =>
    set((s) => {
      const categories = s.categories.filter((c) => c.id !== id)
      const links = s.links.filter((l) => l.categoryId !== id)
      save(s.userName, categories, links)
      return { categories, links }
    }),

  renameCategory: (id, name) =>
    set((s) => {
      const categories = s.categories.map((c) =>
        c.id === id ? { ...c, name: name.trim() || c.name } : c,
      )
      save(s.userName, categories, s.links)
      return { categories }
    }),

  reorderCategories: (orderedIds) =>
    set((s) => {
      const byId = new Map(s.categories.map((c) => [c.id, c]))
      const categories = orderedIds
        .map((id) => byId.get(id))
        .filter((c): c is MyBellCategory => c != null)
      save(s.userName, categories, s.links)
      return { categories }
    }),

  addLink: (categoryId, title, url) =>
    set((s) => {
      const links = [
        ...s.links,
        {
          id: uniqueId(),
          title,
          url: url.startsWith("http") ? url : `https://${url}`,
          categoryId,
          clickCount: 0,
          savedAt: Date.now(),
        },
      ]
      save(s.userName, s.categories, links)
      return { links }
    }),

  updateLink: (id, updates) =>
    set((s) => {
      const links = s.links.map((l) => {
        if (l.id !== id) return l
        const url = updates.url?.trim()
        return {
          ...l,
          ...(updates.title?.trim() ? { title: updates.title.trim() } : {}),
          ...(url ? { url: url.startsWith("http") ? url : `https://${url}` } : {}),
          ...(updates.colorKey !== undefined ? { colorKey: updates.colorKey } : {}),
        }
      })
      save(s.userName, s.categories, links)
      return { links }
    }),

  reorderLinks: (categoryId, orderedIds) =>
    set((s) => {
      const byId = new Map(s.links.map((l) => [l.id, l]))
      const reordered = orderedIds
        .map((id) => byId.get(id))
        .filter((l): l is MyBellLink => l != null)
      const others = s.links.filter((l) => l.categoryId !== categoryId)
      const links = [...reordered, ...others]
      save(s.userName, s.categories, links)
      return { links }
    }),

  deleteLink: (id) =>
    set((s) => {
      const links = s.links.filter((l) => l.id !== id)
      save(s.userName, s.categories, links)
      return { links }
    }),

  recordClick: (id) =>
    set((s) => {
      const links = s.links.map((l) =>
        l.id === id ? { ...l, clickCount: l.clickCount + 1 } : l,
      )
      save(s.userName, s.categories, links)
      return { links }
    }),
}))

// 다른 탭에서 localStorage가 변경되면 이 탭의 스토어도 동기화
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY || !e.newValue) return
    const fresh = load()
    useMyBellStore.setState({
      userName: fresh.userName,
      categories: fresh.categories,
      links: fresh.links,
    })
  })
}

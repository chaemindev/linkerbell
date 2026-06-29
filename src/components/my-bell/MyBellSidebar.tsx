import { useRef, useState } from "react"
import { Check, ChevronDown, ChevronRight, Pencil, Plus, X } from "lucide-react"
import { useMyBellStore } from "@/store/useMyBellStore"
import { cn } from "@/lib/utils"
import { CATEGORY_PALETTE } from "@/components/my-bell/myBellConstants"

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "")
  } catch {
    return url
  }
}

interface RecentLink {
  id: number
  title: string
  url: string
  categoryId: number
}

interface SidebarLink {
  id: number
  title: string
  url: string
}

interface Category {
  id: number
  name: string
  links: SidebarLink[]
}

interface Props {
  categories: Category[]
  recentLinks: RecentLink[]
  onAddCategory: (name: string) => void
}

function CategoryTreeItem({ cat, index }: { cat: Category; index: number }) {
  const [open, setOpen] = useState(false)
  const { dot } = CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]

  return (
    <li>
      {/* 카테고리 행 */}
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-slate-50"
        onClick={() => setOpen((v) => !v)}
      >
        {open
          ? <ChevronDown className="h-3 w-3 shrink-0 text-slate-400" />
          : <ChevronRight className="h-3 w-3 shrink-0 text-slate-400" />
        }
        <span className={cn("h-2 w-2 shrink-0 rounded-full", dot)} />
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
          {cat.name}
        </span>
        <span className="text-xs font-semibold text-slate-400">{cat.links.length}</span>
      </button>

      {/* 링크 목록 */}
      {open && (
        <ul className="ml-5 mt-0.5 space-y-0.5 border-l border-slate-100 pl-2">
          {cat.links.length === 0 ? (
            <li className="px-2 py-1 text-xs italic text-slate-400">링크가 없어요</li>
          ) : (
            cat.links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate rounded px-2 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  {link.title}
                </a>
              </li>
            ))
          )}
        </ul>
      )}
    </li>
  )
}

export function MyBellSidebar({ categories, recentLinks, onAddCategory }: Props) {
  const userName = useMyBellStore((s) => s.userName)
  const setUserName = useMyBellStore((s) => s.setUserName)

  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState("")
  const nameInputRef = useRef<HTMLInputElement>(null)

  const startEditName = () => {
    setNameDraft(userName)
    setEditingName(true)
    setTimeout(() => nameInputRef.current?.focus(), 0)
  }

  const confirmName = () => {
    setUserName(nameDraft)
    setEditingName(false)
  }

  const cancelName = () => setEditingName(false)

  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState("")

  const handleAdd = () => {
    const name = newName.trim()
    if (!name) return
    onAddCategory(name)
    setNewName("")
    setAdding(false)
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col overflow-y-auto border-r bg-white/90">
      {/* User profile */}
      <div className="flex items-center gap-3 border-b px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100">
          <span className="text-sm font-bold text-violet-600">
            {userName.charAt(0)}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          {editingName ? (
            <div className="flex items-center gap-1">
              <input
                ref={nameInputRef}
                className="h-7 min-w-0 flex-1 rounded border border-violet-300 bg-white px-2 text-sm font-bold text-slate-800 outline-none focus:ring-1 focus:ring-violet-300"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmName()
                  if (e.key === "Escape") cancelName()
                }}
                maxLength={20}
              />
              <button
                type="button"
                onClick={confirmName}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-violet-500 hover:bg-violet-50"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={cancelName}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="group flex items-center gap-1.5">
              <p className="truncate text-sm font-bold text-slate-800">{userName}</p>
              <button
                type="button"
                onClick={startEditName}
                className="invisible flex h-5 w-5 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 group-hover:visible"
                aria-label="이름 수정"
              >
                <Pencil className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Collections */}
      <div className="px-4 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[15px] font-bold uppercase tracking-widest text-slate-400">카테고리</p>
          <button
            type="button"
            aria-label={adding ? "카테고리 추가 닫기" : "카테고리 추가"}
            className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            onClick={() => {
              if (adding) { setAdding(false); setNewName("") }
              else setAdding(true)
            }}
          >
            {adding
              ? <X className="h-3.5 w-3.5" />
              : <Plus className="h-3.5 w-3.5" />}
          </button>
        </div>

        {adding && (
          <div className="mb-2 flex gap-1.5">
            <input
              autoFocus
              placeholder="카테고리 이름"
              className="h-8 min-w-0 flex-1 rounded-md border border-slate-200 px-2.5 text-xs outline-none focus:border-violet-300 focus:ring-1 focus:ring-violet-200"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd()
                if (e.key === "Escape") { setAdding(false); setNewName("") }
              }}
            />
            <button
              type="button"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-violet-100 text-violet-600 transition-colors hover:bg-violet-200"
              onClick={handleAdd}
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <ul className="space-y-0.5">
          {categories.map((cat, i) => (
            <CategoryTreeItem key={cat.id} cat={cat} index={i} />
          ))}
          {categories.length === 0 && !adding && (
            <p className="px-2 py-2 text-xs text-slate-400">
              + 버튼으로 카테고리를 추가해 보세요
            </p>
          )}
        </ul>
      </div>

      {/* Recent saved */}
      {recentLinks.length > 0 && (
        <div className="mt-6 px-4 pb-6">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            최근 저장
          </p>
          <ul className="space-y-1">
            {recentLinks.map((link) => {
              const catIndex = categories.findIndex((c) => c.id === link.categoryId)
              const { thumbnailBg } = CATEGORY_PALETTE[
                Math.max(catIndex, 0) % CATEGORY_PALETTE.length
              ]
              return (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50"
                  >
                    <div
                      className={cn(
                        "flex h-3 w-3 shrink-0 items-start justify-center mt-0.5 rounded-md text-[10px] font-bold text-slate-500",
                        thumbnailBg,
                      )}
                    >
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-xs font-medium text-slate-700">
                        {link.title}
                      </p>
                      <p className="line-clamp-1 text-[10px] text-slate-400">
                        {getDomain(link.url)}
                      </p>
                    </div>
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </aside>
  )
}

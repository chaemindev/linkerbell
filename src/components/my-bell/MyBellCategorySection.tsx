import { useEffect, useRef, useState } from "react"
import { Check, GripVertical, Pencil, Plus, Trash2, X } from "lucide-react"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { MyBellLinkCard } from "@/components/my-bell/MyBellLinkCard"
import { useMyBellStore } from "@/store/useMyBellStore"
import { CATEGORY_PALETTE } from "@/components/my-bell/myBellConstants"
import { sortableTransition } from "@/lib/dndSortable"
import { cn } from "@/lib/utils"

interface Link {
  id: number
  title: string
  url: string
  clickCount: number
}

interface Props {
  id: number
  name: string
  colorIndex: number
  links: Link[]
  categoryReorderEnabled: boolean
}

// ── 링크 한 행: 표시 + 수정/삭제 + 드래그 ─────────────────────
function LinkRow({
  link,
  categoryId,
  dragEnabled,
}: {
  link: Link
  categoryId: number
  dragEnabled: boolean
}) {
  const updateLink = useMyBellStore((s) => s.updateLink)
  const deleteLink = useMyBellStore((s) => s.deleteLink)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `link-${link.id}`,
    disabled: !dragEnabled,
    data: { type: "link" as const, categoryId },
    transition: sortableTransition,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { opacity: 0 } : undefined),
  }

  const [editing, setEditing] = useState(false)
  const [titleDraft, setTitleDraft] = useState("")
  const [urlDraft, setUrlDraft] = useState("")
  const titleRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  const startEdit = () => {
    setTitleDraft(link.title)
    setUrlDraft(link.url)
    setEditing(true)
    setTimeout(() => titleRef.current?.focus(), 0)
  }

  const confirmEdit = () => {
    if (!titleDraft.trim() || !urlDraft.trim()) return
    updateLink(link.id, { title: titleDraft, url: urlDraft })
    setEditing(false)
  }

  const cancelEdit = () => setEditing(false)

  // 외부 클릭 시 편집 폼 닫기
  useEffect(() => {
    if (!editing) return
    const handler = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        cancelEdit()
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [editing])

  const handleDelete = () => {
    if (window.confirm(`"${link.title}" 링크를 삭제할까요?`)) {
      deleteLink(link.id)
    }
  }

  if (editing) {
    return (
      <div
        ref={formRef}
        className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50/60 px-3 py-2.5"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <input
            ref={titleRef}
            placeholder="링크 이름"
            className="h-7 w-full min-w-0 rounded-md border border-slate-200 bg-white px-2.5 text-xs outline-none focus:border-violet-300 focus:ring-1 focus:ring-violet-200"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmEdit()
              if (e.key === "Escape") cancelEdit()
            }}
          />
          <input
            placeholder="URL (예: google.com)"
            className="h-7 w-full min-w-0 rounded-md border border-slate-200 bg-white px-2.5 text-xs outline-none focus:border-violet-300 focus:ring-1 focus:ring-violet-200"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmEdit()
              if (e.key === "Escape") cancelEdit()
            }}
          />
        </div>
        <button
          type="button"
          onClick={confirmEdit}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-violet-500 text-white transition-colors hover:bg-violet-600"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("group relative", isDragging && "relative z-10")}
    >
      <div
        className={cn(
          "relative min-w-0",
          dragEnabled &&
            "cursor-grab touch-manipulation active:cursor-grabbing [-webkit-touch-callout:none]",
        )}
        onContextMenu={(e) => {
          if (dragEnabled) e.preventDefault()
        }}
        {...(dragEnabled ? attributes : {})}
        {...(dragEnabled ? listeners : {})}
      >
        <MyBellLinkCard
          id={link.id}
          title={link.title}
          url={link.url}
          clickCount={link.clickCount}
        />
        <div
          className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label="링크 수정"
            onClick={startEdit}
            className="flex h-6 w-6 items-center justify-center rounded bg-white/90 text-slate-400 shadow-sm transition-colors hover:bg-violet-50 hover:text-violet-500"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            type="button"
            aria-label="링크 삭제"
            onClick={handleDelete}
            className="flex h-6 w-6 items-center justify-center rounded bg-white/90 text-slate-400 shadow-sm transition-colors hover:bg-rose-50 hover:text-rose-500"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 카테고리 섹션 ─────────────────────────────────────────────
export function MyBellCategorySection({
  id,
  name,
  colorIndex,
  links,
  categoryReorderEnabled,
}: Props) {
  const { dot } = CATEGORY_PALETTE[colorIndex % CATEGORY_PALETTE.length]

  const {
    attributes: catAttributes,
    listeners: catListeners,
    setNodeRef: setCatNodeRef,
    setActivatorNodeRef: setCatActivatorNodeRef,
    transform: catTransform,
    transition: catTransition,
    isDragging: catIsDragging,
  } = useSortable({
    id: `category-${id}`,
    disabled: !categoryReorderEnabled,
    data: { type: "category" as const, categoryId: id },
    transition: sortableTransition,
  })
  const catStyle = {
    transform: CSS.Transform.toString(catTransform),
    transition: catTransition,
    ...(catIsDragging ? { opacity: 0 } : undefined),
  }

  const [adding, setAdding] = useState(false)
  const [titleDraft, setTitleDraft] = useState("")
  const [urlDraft, setUrlDraft] = useState("")
  const titleRef = useRef<HTMLInputElement>(null)
  const addFormRef = useRef<HTMLDivElement>(null)

  const [renameOpen, setRenameOpen] = useState(false)
  const [renameDraft, setRenameDraft] = useState("")
  const renameRef = useRef<HTMLInputElement>(null)

  const deleteCategory = useMyBellStore((s) => s.deleteCategory)
  const renameCategory = useMyBellStore((s) => s.renameCategory)
  const addLink = useMyBellStore((s) => s.addLink)

  const startAdding = () => {
    setAdding(true)
    setTimeout(() => titleRef.current?.focus(), 0)
  }

  const confirmAdd = () => {
    if (!titleDraft.trim() || !urlDraft.trim()) return
    addLink(id, titleDraft.trim(), urlDraft.trim())
    setTitleDraft("")
    setUrlDraft("")
    setAdding(false)
  }

  const cancelAdd = () => {
    setTitleDraft("")
    setUrlDraft("")
    setAdding(false)
  }

  // 외부 클릭 시 추가 폼 닫기
  useEffect(() => {
    if (!adding) return
    const handler = (e: MouseEvent) => {
      if (addFormRef.current && !addFormRef.current.contains(e.target as Node)) {
        cancelAdd()
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [adding])

  const handleDelete = () => {
    if (window.confirm(`"${name}" 카테고리와 모든 링크를 삭제할까요?`)) {
      deleteCategory(id)
    }
  }

  const openRename = () => {
    setRenameDraft(name)
    setRenameOpen(true)
    setTimeout(() => renameRef.current?.focus(), 0)
  }

  const confirmRename = () => {
    if (!renameDraft.trim()) return
    renameCategory(id, renameDraft.trim())
    setRenameOpen(false)
  }

  const cancelRename = () => setRenameOpen(false)

  const linkDragEnabled = links.length > 1
  const linkSortableIds = links.map((l) => `link-${l.id}`)

  return (
    <section
      ref={setCatNodeRef}
      style={catStyle}
      className={cn("space-y-3", catIsDragging && "relative z-10")}
    >
      {/* 헤더 */}
      <div className="flex items-center gap-1.5">
        {categoryReorderEnabled ? (
          <button
            ref={setCatActivatorNodeRef}
            type="button"
            className="cursor-grab touch-manipulation text-slate-300 transition-colors hover:text-slate-400 active:cursor-grabbing"
            {...catAttributes}
            {...catListeners}
          >
            <GripVertical className="h-3.5 w-3.5 shrink-0" />
          </button>
        ) : null}

        <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", dot)} />

        {renameOpen ? (
          /* 인라인 카테고리명 수정 */
          <>
            <input
              ref={renameRef}
              className="h-7 min-w-0 flex-1 rounded-md border border-violet-300 bg-white px-2.5 text-sm font-bold text-slate-800 outline-none focus:ring-1 focus:ring-violet-300"
              value={renameDraft}
              onChange={(e) => setRenameDraft(e.target.value)}
              onBlur={confirmRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmRename()
                if (e.key === "Escape") cancelRename()
              }}
              maxLength={30}
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={confirmRename}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-violet-500 transition-colors hover:bg-violet-50"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={cancelRename}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          /* 일반 상태 */
          <>
            <button
              type="button"
              className="min-w-0 truncate text-base font-bold text-slate-800 transition-colors hover:text-violet-600"
              onClick={openRename}
            >
              {name}
            </button>
            <div className="flex-1" />
            <button
              type="button"
              aria-label={adding ? "링크 추가 닫기" : `${name}에 링크 추가`}
              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => { if (adding) cancelAdd(); else startAdding() }}
            >
              {adding ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              aria-label={`${name} 카테고리 삭제`}
              className="rounded-md p-1 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-400"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>

      {/* 인라인 링크 추가 폼 */}
      {adding && (
        <div
          ref={addFormRef}
          className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50/60 px-3 py-2.5"
        >
          <div className="flex min-w-0 flex-1 gap-2">
            <input
              ref={titleRef}
              placeholder="링크 이름"
              className="h-8 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs outline-none focus:border-violet-300 focus:ring-1 focus:ring-violet-200"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmAdd()
                if (e.key === "Escape") cancelAdd()
              }}
            />
            <input
              placeholder="URL (예: google.com)"
              className="h-8 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs outline-none focus:border-violet-300 focus:ring-1 focus:ring-violet-200"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmAdd()
                if (e.key === "Escape") cancelAdd()
              }}
            />
          </div>
          <button
            type="button"
            onClick={confirmAdd}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-violet-500 text-white transition-colors hover:bg-violet-600"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 링크 목록 */}
      {links.length === 0 && !adding ? (
        <div
          className="flex h-20 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-100 text-slate-400 transition-colors hover:border-violet-200 hover:text-violet-400"
          onClick={startAdding}
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="text-xs">링크 추가</span>
        </div>
      ) : linkDragEnabled ? (
        <SortableContext
          id={`links-${id}`}
          items={linkSortableIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="w-full space-y-2">
            {links.map((link) => (
              <LinkRow
                key={link.id}
                link={link}
                categoryId={id}
                dragEnabled={linkDragEnabled}
              />
            ))}
          </div>
        </SortableContext>
      ) : (
        <div className="w-full space-y-2">
          {links.map((link) => (
            <LinkRow
              key={link.id}
              link={link}
              categoryId={id}
              dragEnabled={false}
            />
          ))}
        </div>
      )}
    </section>
  )
}

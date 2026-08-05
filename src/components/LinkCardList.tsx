import { useState, type Dispatch, type SetStateAction } from "react"
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { EditLinkDialog } from "@/components/EditLinkDialog"
import { LinkCardEdit } from "@/components/LinkCardEdit"
import { sortableTransition } from "@/lib/dndSortable"
import {
  getLinkCardTextColors,
  getOurBellLinkCardAppearance,
  isCustomLinkColor,
  normalizeHexColor,
  normalizeLinkColorKey,
  type LinkColorKey,
} from "@/lib/linkColorPalette"
import { openLinkInNewTab } from "@/lib/url"
import { cn } from "@/lib/utils"
import { useLinkStore } from "@/store/useLinkStore"

/** 링크 리스트 행(플랫 스타일) 배경/점 색 — 프리셋 컬러별 */
const FLAT_ROW_BG: Record<LinkColorKey, string> = {
  default: "",
  rose: "bg-rose-100/70 hover:bg-rose-200/60",
  sky: "bg-sky-100/70 hover:bg-sky-200/60",
  violet: "bg-violet-100/70 hover:bg-violet-200/60",
  emerald: "bg-emerald-100/70 hover:bg-emerald-200/60",
  amber: "bg-amber-100/70 hover:bg-amber-200/60",
  purple: "bg-purple-100/70 hover:bg-purple-200/60",
  teal: "bg-teal-100/70 hover:bg-teal-200/60",
}

const FLAT_ROW_DOT: Record<LinkColorKey, string> = {
  default: "bg-slate-300",
  rose: "bg-rose-400",
  sky: "bg-sky-400",
  violet: "bg-violet-400",
  emerald: "bg-emerald-400",
  amber: "bg-amber-400",
  purple: "bg-purple-400",
  teal: "bg-teal-400",
}

export interface LinkCardListItem {
  id: number
  title: string
  url: string
  color_key?: string | null
}

export interface LinkCardListProps {
  links: LinkCardListItem[]
  categoryId: number
  onDeleteLink: (linkId: number, title: string) => void
  onReorderLinks?: (categoryId: number, orderedLinkIds: number[]) => void
}

export function LinkRowContent({
  link,
  sortableDrag,
  dragOverlay,
  menuOpenLinkId,
  editingLink,
  setEditingLink,
  setMenuOpenLinkId,
  onDeleteLink,
}: {
  link: LinkCardListItem
  sortableDrag?: {
    attributes: DraggableAttributes
    listeners: DraggableSyntheticListeners | undefined
  }
  /** 드래그 중 떠 있는 미리보기 카드 */
  dragOverlay?: boolean
  menuOpenLinkId: number | null
  editingLink: LinkCardListItem | null
  setEditingLink: Dispatch<SetStateAction<LinkCardListItem | null>>
  setMenuOpenLinkId: Dispatch<SetStateAction<number | null>>
  onDeleteLink: (linkId: number, title: string) => void
}) {
  if (dragOverlay) {
    const cardAppearance = getOurBellLinkCardAppearance(link.color_key, { dragOverlay })
    return (
      <div
        className={cn(
          "group flex h-15 min-w-85 shrink-0 items-center overflow-hidden rounded-[40px] border",
          cardAppearance.className,
        )}
        style={{
          ...cardAppearance.style,
          ["--link-title" as string]: cardAppearance.textColors.title,
        }}
      >
        <div className="flex min-h-0 min-w-0 flex-1 items-center px-6 py-4">
          <span className="line-clamp-1 text-sm font-medium tracking-tight text-(--link-title)">
            {link.title}
          </span>
        </div>
      </div>
    )
  }

  const isCustom = isCustomLinkColor(link.color_key)
  const hex = isCustom ? normalizeHexColor(link.color_key as string) : null
  const colorKey = normalizeLinkColorKey(link.color_key)
  const customTextColors = hex ? getLinkCardTextColors(hex) : null

  return (
    <div
      className={cn(
        "group flex w-full min-w-0 items-center gap-3 rounded-2xl px-4 py-3 transition-colors duration-200",
        !isCustom && (colorKey === "default" ? "hover:bg-slate-50" : FLAT_ROW_BG[colorKey]),
        sortableDrag && "cursor-grab touch-manipulation active:cursor-grabbing [-webkit-touch-callout:none]",
      )}
      style={isCustom && hex ? { backgroundColor: `${hex}26` } : undefined}
      onContextMenu={(e) => {
        if (sortableDrag) e.preventDefault()
      }}
      {...sortableDrag?.attributes}
      {...sortableDrag?.listeners}
    >
      <button
        type="button"
        className="flex min-h-0 min-w-0 flex-1 cursor-pointer select-none items-center gap-3 overflow-hidden border-0 bg-transparent text-left [-webkit-touch-callout:none] [touch-callout:none] touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 focus-visible:ring-offset-2"
        onClick={() => {
          useLinkStore.getState().recordLinkClick(link.id)
          openLinkInNewTab(link.url)
        }}
        aria-label={`${link.title}, 새 탭에서 열기`}
      >
        <span
          className={cn("size-2 shrink-0 rounded-full", !isCustom && FLAT_ROW_DOT[colorKey])}
          style={isCustom && hex ? { backgroundColor: hex } : undefined}
          aria-hidden
        />
        <span
          className={cn(
            "line-clamp-1 min-w-0 flex-1 text-[15px] font-medium tracking-tight",
            !isCustom && "text-slate-800",
          )}
          style={isCustom && customTextColors ? { color: customTextColors.title } : undefined}
        >
          {link.title}
        </span>
      </button>
      <div
        className="shrink-0 touch-manipulation"
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <LinkCardEdit
          keepVisible={menuOpenLinkId === link.id || editingLink?.id === link.id}
          onMenuOpenChange={(open: boolean) => setMenuOpenLinkId(open ? link.id : null)}
          onEditLink={() => setEditingLink(link)}
          onDelete={() => onDeleteLink(link.id, link.title)}
          link={{ title: link.title, url: link.url }}
        />
      </div>
    </div>
  )
}

function SortableLinkRow({
  link,
  categoryId,
  dragEnabled,
  menuOpenLinkId,
  editingLink,
  setEditingLink,
  setMenuOpenLinkId,
  onDeleteLink,
}: {
  link: LinkCardListItem
  categoryId: number
  dragEnabled: boolean
  menuOpenLinkId: number | null
  editingLink: LinkCardListItem | null
  setEditingLink: Dispatch<SetStateAction<LinkCardListItem | null>>
  setMenuOpenLinkId: Dispatch<SetStateAction<number | null>>
  onDeleteLink: (linkId: number, title: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `link-${link.id}`,
    disabled: !dragEnabled,
    transition: sortableTransition,
    data: { type: "link" as const, categoryId },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { opacity: 0 } : undefined),
  }

  return (
    <li ref={setNodeRef} style={style} className={cn(isDragging && "relative z-10")}>
      <LinkRowContent
        link={link}
        sortableDrag={
          dragEnabled ? { attributes, listeners } : undefined
        }
        menuOpenLinkId={menuOpenLinkId}
        editingLink={editingLink}
        setEditingLink={setEditingLink}
        setMenuOpenLinkId={setMenuOpenLinkId}
        onDeleteLink={onDeleteLink}
      />
    </li>
  )
}

export function LinkCardList({
  links,
  categoryId,
  onDeleteLink,
  onReorderLinks,
}: LinkCardListProps) {
  const items = (links ?? []).filter((link) => link?.title != null)
  const [editingLink, setEditingLink] = useState<LinkCardListItem | null>(null)
  const [menuOpenLinkId, setMenuOpenLinkId] = useState<number | null>(null)
  const updateLink = useLinkStore((state) => state.updateLink)
  const allCategories = useLinkStore((state) => state.categories)

  const dragEnabled = Boolean(onReorderLinks && items.length > 1)
  const sortableIds = items.map((l) => `link-${l.id}`)

  const listBody = dragEnabled ? (
    <SortableContext
      id={`links-${categoryId}`}
      items={sortableIds}
      strategy={verticalListSortingStrategy}
    >
      {items.map((link) => (
        <SortableLinkRow
          key={link.id}
          link={link}
          categoryId={categoryId}
          dragEnabled={dragEnabled}
          menuOpenLinkId={menuOpenLinkId}
          editingLink={editingLink}
          setEditingLink={setEditingLink}
          setMenuOpenLinkId={setMenuOpenLinkId}
          onDeleteLink={onDeleteLink}
        />
      ))}
    </SortableContext>
  ) : (
    items.map((link, idx) => (
      <li key={link.id > 0 ? link.id : `link-${idx}`}>
        <LinkRowContent
          link={link}
          menuOpenLinkId={menuOpenLinkId}
          editingLink={editingLink}
          setEditingLink={setEditingLink}
          setMenuOpenLinkId={setMenuOpenLinkId}
          onDeleteLink={onDeleteLink}
        />
      </li>
    ))
  )

  return (
    <ul className="min-h-0 flex-1 list-none space-y-1 overflow-hidden p-0">
      {listBody}

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-100 p-8">
          <p className="text-xs italic text-slate-400">저장된 링크가 없어요</p>
        </div>
      )}

      <EditLinkDialog
        linkId={editingLink?.id ?? 0}
        initialTitle={editingLink?.title ?? ""}
        initialUrl={editingLink?.url ?? ""}
        initialColorKey={editingLink?.color_key ?? null}
        categories={allCategories}
        initialCategoryId={categoryId}
        open={editingLink !== null}
        previewVariant="our-bell"
        onOpenChange={(next) => {
          if (!next) setEditingLink(null)
        }}
        onSave={async (updates) => {
          if (!editingLink) return false
          return updateLink(editingLink.id, updates)
        }}
      />
    </ul>
  )
}

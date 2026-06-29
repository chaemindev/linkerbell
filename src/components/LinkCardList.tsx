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
import { getOurBellLinkCardAppearance } from "@/lib/linkColorPalette"
import { openLinkInNewTab } from "@/lib/url"
import { cn } from "@/lib/utils"
import { useLinkStore } from "@/store/useLinkStore"

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
  const cardAppearance = getOurBellLinkCardAppearance(link.color_key, {
    dragOverlay,
  })

  return (
    <div
      className={cn(
        "group flex h-15 min-w-85 shrink-0 items-center overflow-hidden rounded-[40px] border transition-[box-shadow,background-color,transform] duration-420 ease-[cubic-bezier(0.22,1,0.36,1)]",
        cardAppearance.className,
        sortableDrag && !dragOverlay && "cursor-grab touch-manipulation active:cursor-grabbing [-webkit-touch-callout:none]",
      )}
      style={{
        ...cardAppearance.style,
        ["--link-title" as string]: cardAppearance.textColors.title,
        ["--link-title-hover" as string]: cardAppearance.textColors.titleHover,
      }}
      onContextMenu={(e) => {
        if (sortableDrag) e.preventDefault()
      }}
      {...sortableDrag?.attributes}
      {...sortableDrag?.listeners}
    >
      <button
        type="button"
        className="flex min-h-0 min-w-0 flex-1 cursor-pointer select-none items-center justify-between overflow-hidden border-0 bg-transparent px-6 py-4 pr-2 text-left [-webkit-touch-callout:none] [touch-callout:none] touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 focus-visible:ring-offset-2"
        onClick={() => {
          useLinkStore.getState().recordLinkClick(link.id)
          openLinkInNewTab(link.url)
        }}
        aria-label={`${link.title}, 새 탭에서 열기`}
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-0.5 overflow-hidden pr-2">
          <span className="line-clamp-1 text-sm font-medium tracking-tight text-(--link-title) transition-colors group-hover:text-(--link-title-hover)">
            {link.title}
          </span>
        </div>
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
    <ul className="min-h-0 flex-1 list-none space-y-3 overflow-hidden p-0">
      {listBody}

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-[40px] border-2 border-dashed border-slate-100 p-8">
          <p className="text-xs italic text-slate-400">저장된 링크가 없어요</p>
        </div>
      )}

      <EditLinkDialog
        linkId={editingLink?.id ?? 0}
        initialTitle={editingLink?.title ?? ""}
        initialUrl={editingLink?.url ?? ""}
        initialColorKey={editingLink?.color_key ?? null}
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

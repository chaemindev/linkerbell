import { useState, type Dispatch, type SetStateAction } from "react"
import {
  DndContext,
  DragOverlay,
  closestCenter,
  defaultDropAnimation,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { EditLinkDialog } from "@/components/EditLinkDialog"
import { LinkCardEdit } from "@/components/LinkCardEdit"
import { cn } from "@/lib/utils"

/** 드롭 시 오버레이가 제자리로 스냅되는 애니메이션 */
const linkDropAnimation = {
  ...defaultDropAnimation,
  duration: 380,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const

/** 리스트가 재배열될 때 다른 항목이 부드럽게 밀리는 전환 */
const sortableTransition = {
  duration: 320,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const

export interface LinkCardListItem {
  id: number
  title: string
  url: string
}

export interface LinkCardListProps {
  links: LinkCardListItem[]
  categoryId: number
  onDeleteLink: (linkId: number, title: string) => void
  onReorderLinks?: (categoryId: number, orderedLinkIds: number[]) => void
}

function LinkRowContent({
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
  return (
    <div
      className={cn(
        "group flex h-15 min-w-85 shrink-0 items-center overflow-hidden rounded-[40px] border transition-[box-shadow,background-color,transform] duration-420 ease-[cubic-bezier(0.22,1,0.36,1)]",
        dragOverlay
          ? "border-sky-50/90 bg-linear-to-br from-white via-white to-sky-50/12 shadow-[0_4px_20px_-4px_rgba(240,249,255,0.85),0_2px_8px_-2px_rgba(224,242,254,0.45)]"
          : "border-slate-50 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02),0_8px_30px_-8px_rgba(0,0,0,0.05)] hover:bg-slate-50/80 hover:shadow-[0_2px_4px_rgba(0,0,0,0.03),0_14px_40px_-10px_rgba(0,0,0,0.07)]",
        sortableDrag && !dragOverlay && "cursor-grab touch-manipulation active:cursor-grabbing",
      )}
      onContextMenu={(e) => {
        if (sortableDrag) e.preventDefault()
      }}
      {...sortableDrag?.attributes}
      {...sortableDrag?.listeners}
    >
      <a
        href={link.url ?? "#"}
        target="_blank"
        rel="noreferrer"
        draggable={false}
        className="flex min-h-0 min-w-0 flex-1 select-none items-center justify-between overflow-hidden px-6 py-4 pr-2 [touch-callout:none]"
        onDragStart={(e) => e.preventDefault()}
        onContextMenu={(e) => {
          if (sortableDrag) e.preventDefault()
        }}
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-0.5 overflow-hidden pr-2">
          <span className="line-clamp-1 text-sm font-medium tracking-tight text-slate-900 group-hover:text-slate-950">
            {link.title}
          </span>
        </div>
      </a>
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
        />
      </div>
    </div>
  )
}

function SortableLinkRow({
  link,
  dragEnabled,
  menuOpenLinkId,
  editingLink,
  setEditingLink,
  setMenuOpenLinkId,
  onDeleteLink,
}: {
  link: LinkCardListItem
  dragEnabled: boolean
  menuOpenLinkId: number | null
  editingLink: LinkCardListItem | null
  setEditingLink: Dispatch<SetStateAction<LinkCardListItem | null>>
  setMenuOpenLinkId: Dispatch<SetStateAction<number | null>>
  onDeleteLink: (linkId: number, title: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
    disabled: !dragEnabled,
    transition: sortableTransition,
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
  const [activeDragId, setActiveDragId] = useState<number | null>(null)
  const [editingLink, setEditingLink] = useState<LinkCardListItem | null>(null)
  const [menuOpenLinkId, setMenuOpenLinkId] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const dragEnabled = Boolean(onReorderLinks && items.length > 1)
  const sortableIds = items.map((l) => l.id)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(Number(event.active.id))
  }

  const handleDragCancel = () => {
    setActiveDragId(null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null)
    if (!onReorderLinks) return
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((l) => l.id === active.id)
    const newIndex = items.findIndex((l) => l.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const next = arrayMove(items, oldIndex, newIndex)
    onReorderLinks(
      categoryId,
      next.map((l) => l.id),
    )
  }

  const activeDragLink =
    activeDragId != null ? items.find((l) => l.id === activeDragId) : null

  const listBody = dragEnabled ? (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          {items.map((link) => (
            <SortableLinkRow
              key={link.id}
              link={link}
              dragEnabled={dragEnabled}
              menuOpenLinkId={menuOpenLinkId}
              editingLink={editingLink}
              setEditingLink={setEditingLink}
              setMenuOpenLinkId={setMenuOpenLinkId}
              onDeleteLink={onDeleteLink}
            />
          ))}
        </SortableContext>
        <DragOverlay dropAnimation={linkDropAnimation} zIndex={60}>
          {activeDragLink ? (
            <div className="pointer-events-none min-w-85 scale-[1.015] cursor-grabbing rounded-[40px] shadow-[0_18px_42px_-16px_rgba(240,249,255,0.75),0_10px_22px_-10px_rgba(15,23,42,0.04),0_0_0_1px_rgba(240,249,255,0.65)]">
              <LinkRowContent
                dragOverlay
                link={activeDragLink}
                menuOpenLinkId={menuOpenLinkId}
                editingLink={editingLink}
                setEditingLink={setEditingLink}
                setMenuOpenLinkId={setMenuOpenLinkId}
                onDeleteLink={onDeleteLink}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
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
        open={editingLink !== null}
        onOpenChange={(next) => {
          if (!next) setEditingLink(null)
        }}
      />
    </ul>
  )
}

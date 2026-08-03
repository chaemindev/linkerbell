import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core"
import { LinkCardHeader } from "@/components/LinkCardHeader"
import { LinkCardList } from "@/components/LinkCardList"

interface Link {
  id: number
  title: string
  url: string
}

interface LinkCardProps {
  id: number
  name: string
  colorIndex: number
  links: Link[]
  onAddLink: (categoryId: number, title: string, url: string) => void
  onDeleteLink: (linkId: number, title: string) => void
  onReorderLinks?: (categoryId: number, orderedLinkIds: number[]) => void
  onDeleteCategory: (categoryId: number) => void
  categoryDragActivatorNodeRef?: (element: HTMLElement | null) => void
  categoryDragAttributes?: DraggableAttributes
  categoryDragListeners?: DraggableSyntheticListeners | undefined
}

export function LinkCard({
  id,
  name,
  colorIndex,
  links,
  onAddLink,
  onDeleteLink,
  onReorderLinks,
  onDeleteCategory,
  categoryDragActivatorNodeRef,
  categoryDragAttributes,
  categoryDragListeners,
}: LinkCardProps) {
  return (
    <div className="flex flex-col gap-5 rounded-3xl bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_20px_40px_-20px_rgba(15,23,42,0.14)]">
      <LinkCardHeader
        categoryId={id}
        categoryName={name}
        colorIndex={colorIndex}
        onAddLink={onAddLink}
        onDeleteCategory={onDeleteCategory}
        categoryDragActivatorNodeRef={categoryDragActivatorNodeRef}
        categoryDragAttributes={categoryDragAttributes}
        categoryDragListeners={categoryDragListeners}
      />

      <LinkCardList
        categoryId={id}
        links={links}
        onDeleteLink={onDeleteLink}
        onReorderLinks={onReorderLinks}
      />
    </div>
  )
}

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
    <div className="flex flex-col gap-3">
      <LinkCardHeader
        categoryId={id}
        categoryName={name}
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

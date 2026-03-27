import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { LinkCard } from "@/components/LinkCard"
import { sortableTransition } from "@/lib/dndSortable"
import { cn } from "@/lib/utils"

interface LinkItem {
  id: number
  title: string
  url: string
}

export interface SortableCategoryCardProps {
  category: {
    id: number
    name: string
    links: LinkItem[]
  }
  categoryReorderEnabled: boolean
  onAddLink: (categoryId: number, title: string, url: string) => void
  onDeleteLink: (linkId: number, title: string) => void
  onReorderLinks?: (categoryId: number, orderedLinkIds: number[]) => void
  onDeleteCategory: (categoryId: number) => void
}

export function SortableCategoryCard({
  category,
  categoryReorderEnabled,
  onAddLink,
  onDeleteLink,
  onReorderLinks,
  onDeleteCategory,
}: SortableCategoryCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `category-${category.id}`,
    disabled: !categoryReorderEnabled,
    data: { type: "category" as const, categoryId: category.id },
    transition: sortableTransition,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { opacity: 0 } : undefined),
  }

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "relative z-10")}>
      <LinkCard
        id={category.id}
        name={category.name}
        links={category.links}
        onAddLink={onAddLink}
        onDeleteLink={onDeleteLink}
        onReorderLinks={onReorderLinks}
        onDeleteCategory={onDeleteCategory}
        categoryDragActivatorNodeRef={
          categoryReorderEnabled ? setActivatorNodeRef : undefined
        }
        categoryDragAttributes={categoryReorderEnabled ? attributes : undefined}
        categoryDragListeners={categoryReorderEnabled ? listeners : undefined}
      />
    </div>
  )
}

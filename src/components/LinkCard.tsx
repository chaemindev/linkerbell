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
  onDeleteCategory: (categoryId: number) => void
}

export function LinkCard({
  id,
  name,
  links,
  onAddLink,
  onDeleteLink,
  onDeleteCategory,
}: LinkCardProps) {
  return (
    <div className="flex flex-col gap-3">
      <LinkCardHeader
        categoryId={id}
        categoryName={name}
        onAddLink={onAddLink}
        onDeleteCategory={onDeleteCategory}
      />

      <LinkCardList links={links} onDeleteLink={onDeleteLink} />
    </div>
  )
}

import { useEffect } from "react"
import { AddCategoryDialog } from "@/components/AddCategoryDialog"
import { LinkCard } from "@/components/LinkCard"
import { PageTitle } from "./PageTitle"
import { useLinkStore } from "@/store/useLinkStore"

export function Container() {
  const categories = useLinkStore((state) => state.categories)
  const fetchCategories = useLinkStore((state) => state.fetchCategories)
  const addLink = useLinkStore((state) => state.addLink)
  const deleteLink = useLinkStore((state) => state.deleteLink)
  const deleteCategory = useLinkStore((state) => state.deleteCategory)

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleAddLink = (categoryId: number, title: string, url: string) => {
    addLink(categoryId, title, url.startsWith("http") ? url : `https://${url}`)
  }

  const handleDeleteLink = (linkId: number, title: string) => {
    if (!window.confirm(`${title} 링크를 삭제할까요?`)) return
    void deleteLink(linkId)
  }

  const handleDeleteCategory = (categoryId: number) => {
    void deleteCategory(categoryId)
  }

  return (
    <main className="mx-auto max-w-7xl flex-1 px-6 py-12">
      <PageTitle />
      <div className="mb-1 flex justify-end">
        <AddCategoryDialog />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <LinkCard
            key={category.id}
            id={category.id}
            name={category.name}
            links={category.links}
            onAddLink={handleAddLink}
            onDeleteLink={handleDeleteLink}
            onDeleteCategory={handleDeleteCategory}
          />
        ))}
      </div>
    </main>
  )
}

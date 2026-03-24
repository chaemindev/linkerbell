import { useEffect } from "react"
import { AddCategoryDialog } from "@/components/AddCategoryDialog"
import { CategoryCard } from "@/components/CategoryCard"
import { PageTitle } from "./PageTitle"
import { useLinkStore } from "@/store/useLinkStore"

export function Container() {
  const categories = useLinkStore((state) => state.categories)
  const fetchCategories = useLinkStore((state) => state.fetchCategories)
  const addLink = useLinkStore((state) => state.addLink)

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleAddLink = (categoryId: number, title: string, url: string) => {
    addLink(categoryId, title, url.startsWith("http") ? url : `https://${url}`)
  }

  return (
    <main className="mx-auto max-w-7xl flex-1 px-6 py-12">
      <PageTitle />
      <div className="mb-1 flex justify-end">
        <AddCategoryDialog />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            id={category.id}
            name={category.name}
            links={category.links}
            onAddLink={handleAddLink}
          />
        ))}
      </div>
    </main>
  )
}

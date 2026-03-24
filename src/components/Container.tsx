import { useEffect } from "react"
import { AddCategoryDialog } from "@/components/AddCategoryDialog"
// import { AddLinkDialog } from "@/components/AddLinkDialog"
import { CategoryCard } from "@/components/CategoryCard"
import { Footer } from "@/components/Footer"
import { PageTitle } from "./PageTitle"
import { useLinkStore } from "@/store/useLinkStore"

export function Container() {
  const categories = useLinkStore((state) => state.categories)
  const fetchCategories = useLinkStore((state) => state.fetchCategories)
  // const addLink = useLinkStore((state) => state.addLink)

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // const addCategory = (categoryId: number, title: string, url: string) => {
  //   addLink(categoryId, title, url.startsWith("http") ? url : `https://${url}`)
  // }

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">

      <PageTitle />
      <div className="flex justify-end mb-1">
        {/* 카테고리추가  */}
        <AddCategoryDialog />
        {/* <AddLinkDialog categories={categories} onAdd={handleAddLink} /> */}
      </div>


      {/* 4. 카테고리 카드 리스트 렌더링 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => (
          <CategoryCard 
            key={category.id} 
            name={category.name} 
            links={category.links} 
          />
        ))}
      </div>

      {/* 하단 여백용 푸터 */}
      <Footer></Footer>
    </main>
  )
}

import { useState } from "react"
import { AddLinkDialog } from "@/components/AddLinkDialog"
import { CategoryCard } from "@/components/CategoryCard"
import { Footer } from "@/components/Footer"
import { PageTitle } from "./PageTitle"

const INITIAL_CATEGORIES = [
  { id: 1, name: "업무 도구", links: [{ title: "GitHub", url: "https://github.com" }, { title: "SSG.com", url: "https://ssg.com" }] },
  { id: 2, name: "학습 & 레퍼런스", links: [{ title: "React Docs", url: "https://react.dev" }, { title: "shadcn/ui", url: "https://ui.shadcn.com" }] },
  { id: 3, name: "취미 & 일상", links: [{ title: "YouTube", url: "https://youtube.com" }] },
]


interface Category {
  id: number
  name: string
  links: { title: string; url: string }[]
}

export function Container() {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES)

  const handleAddLink = (categoryId: number, title: string, url: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, links: [...cat.links, { title, url: url.startsWith("http") ? url : `https://${url}` }] }
          : cat
      )
    )
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">

      <PageTitle />
      <div className="flex justify-end mb-1">
        <AddLinkDialog categories={categories} onAdd={handleAddLink} />
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

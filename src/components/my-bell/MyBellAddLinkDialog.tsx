import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface Category {
  id: number
  name: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
  onAdd: (categoryId: number, title: string, url: string) => void
  onAddCategory: (name: string) => void
}

export function MyBellAddLinkDialog({ open, onOpenChange, categories, onAdd, onAddCategory }: Props) {
  const [categoryId, setCategoryId] = useState<number | "">("")
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [newCategoryName, setNewCategoryName] = useState("")
  const [showNewCategory, setShowNewCategory] = useState(false)

  const reset = () => {
    setCategoryId("")
    setTitle("")
    setUrl("")
    setNewCategoryName("")
    setShowNewCategory(false)
  }

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
    if (!next) reset()
  }

  const handleAddCategory = () => {
    const name = newCategoryName.trim()
    if (!name) return
    onAddCategory(name)
    setNewCategoryName("")
    setShowNewCategory(false)
  }

  const handleSubmit = () => {
    if (!categoryId || !title.trim() || !url.trim()) {
      alert("카테고리, 링크 이름, URL을 모두 입력해 주세요.")
      return
    }
    onAdd(categoryId as number, title.trim(), url.trim())
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">링크 추가</DialogTitle>
        </DialogHeader>
        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700">카테고리</label>
              <button
                type="button"
                className="text-xs text-violet-500 hover:text-violet-700"
                onClick={() => setShowNewCategory((v) => !v)}
              >
                + 새 카테고리
              </button>
            </div>
            {showNewCategory ? (
              <div className="flex gap-2">
                <Input
                  autoFocus
                  placeholder="카테고리 이름"
                  className="h-9 flex-1 text-sm"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                />
                <Button
                  type="button"
                  size="sm"
                  className="h-9 bg-slate-800 text-xs text-white hover:bg-slate-950"
                  onClick={handleAddCategory}
                >
                  추가
                </Button>
              </div>
            ) : (
              <select
                className="h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">카테고리 선택</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700">링크 이름</label>
            <Input
              placeholder="예: 구글"
              className="h-11"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700">URL 주소</label>
            <Input
              placeholder="google.com"
              className="h-11"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} className="h-11 w-full text-base font-bold bg-slate-900">
            저장하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

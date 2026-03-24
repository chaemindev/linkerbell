import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

interface AddLinkDialogProps {
  categories: { id: number; name: string }[]
  onAdd: (categoryId: number, title: string, url: string) => void
}

export function AddLinkDialog({ categories, onAdd }: AddLinkDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 1)

  const handleSubmit = () => {
    if (!title || !url) return
    onAdd(categoryId, title, url)
    setTitle("")
    setUrl("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
      <Button className="bg-slate-700 hover:bg-slate-950 text-white shadow-md hover:shadow-lg transition-all cursor-pointer rounded-full px-3 h-8 border-none font-bold mb-3">
        <Plus className="w-3 h-3" /> 새 링크 추가
      </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">새로운 링크 저장</DialogTitle>
        </DialogHeader>
        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700">카테고리 선택</label>
            <select 
              className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
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
          <Button onClick={handleSubmit} className="w-full h-11 text-base font-bold bg-slate-900">
            저장하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
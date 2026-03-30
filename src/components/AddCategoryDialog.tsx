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
import { FolderPlus } from "lucide-react"
import { useLinkStore } from "@/store/useLinkStore"

export function AddCategoryDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const addCategory = useLinkStore((state) => state.addCategory)

  const handleSubmit = () => {
    if (!name.trim()) return
    addCategory(name.trim())
    setName("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="hover:bg-[white] shadow-sm transition-all cursor-pointer rounded-full px-5 h-9 font-bold mb-8 bg-[#f2f2f2]">
          <FolderPlus className="w-3 h-3" />카테고리 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">카테고리 추가</DialogTitle>
        </DialogHeader>
        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Input
              placeholder="카테고리 명을 입력해주세요."
              className="h-11"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
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

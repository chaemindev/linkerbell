import { useState, type ReactElement } from "react"
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
import { useLinkStore } from "@/store/useLinkStore"

export function AddCategoryDialog({ trigger }: { trigger?: ReactElement } = {}) {
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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setName("")
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            type="button"
            variant="outline"
            aria-expanded={open}
            className="mb-6 h-9 gap-2 rounded-xl border-slate-200/80 bg-white/80 px-3.5 text-xs font-medium text-slate-600 shadow-none transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-900"
          >
            <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            카테고리 추가
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-3xl border border-rose-100/70 bg-[#fffdfd] p-6 shadow-[0_24px_80px_-24px_rgba(88,57,77,0.25)] ring-0 sm:max-w-[440px]">
        <DialogHeader className="border-b border-rose-100/60 pb-4 pr-6">
          <DialogTitle className="text-lg font-semibold tracking-tight text-slate-800">카테고리 추가</DialogTitle>
        </DialogHeader>
        <div className="grid gap-5 py-2">
          <div className="grid gap-2">
            <label htmlFor="add-category-name" className="text-xs font-medium text-slate-500">카테고리 이름</label>
            <Input
              id="add-category-name"
              placeholder="카테고리 명을 입력해주세요."
              className="h-11 rounded-xl border-slate-200 bg-white shadow-none placeholder:text-slate-400 focus-visible:border-rose-200 focus-visible:ring-rose-100"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
        </div>
        <DialogFooter className="m-0 flex-row justify-end rounded-none border-0 bg-transparent p-0 pt-3">
          <Button type="button" variant="ghost" onClick={() => { setOpen(false); setName("") }} className="h-10 rounded-xl px-5 text-slate-500 hover:bg-slate-100">취소</Button>
          <Button onClick={handleSubmit} className="h-10 rounded-xl border border-rose-200/60 bg-rose-100 px-6 font-semibold text-rose-900 shadow-none hover:bg-rose-200/70">
            저장하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

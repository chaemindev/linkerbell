import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useLinkStore } from "@/store/useLinkStore"

export interface RenameCategoryDialogProps {
  categoryId: number
  currentName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** 다이얼로그가 열릴 때만 마운트되어 `useState(initialName)`으로 값이 맞춰짐 (effect 동기화 불필요) */
function RenameCategoryDialogForm({
  categoryId,
  initialName,
  onOpenChange,
}: {
  categoryId: number
  initialName: string
  onOpenChange: (open: boolean) => void
}) {
  const [name, setName] = useState(initialName)
  const renameCategory = useLinkStore((state) => state.renameCategory)

  const handleSubmit = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      alert("카테고리 이름을 입력해 주세요.")
      return
    }
    const ok = await renameCategory(categoryId, trimmed)
    if (ok) onOpenChange(false)
  }

  return (
    <>
      <DialogHeader className="border-b border-rose-100/60 pb-4 pr-6">
        <DialogTitle className="text-lg font-semibold tracking-tight text-slate-800">카테고리명 수정</DialogTitle>
      </DialogHeader>
      <div className="grid gap-5 py-2">
        <div className="grid gap-2">
          <label htmlFor="rename-category-name" className="text-xs font-medium text-slate-500">카테고리 이름</label>
          <Input
            id="rename-category-name"
            placeholder="이름을 입력하세요"
            className="h-11 rounded-xl border-slate-200 bg-white shadow-none placeholder:text-slate-400 focus-visible:border-rose-200 focus-visible:ring-rose-100"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void handleSubmit()}
          />
        </div>
      </div>
      <DialogFooter className="m-0 flex-row justify-end rounded-none border-0 bg-transparent p-0 pt-3">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-10 rounded-xl px-5 text-slate-500 hover:bg-slate-100">취소</Button>
        <Button type="button" onClick={() => void handleSubmit()} className="h-10 rounded-xl border border-rose-200/60 bg-rose-100 px-6 font-semibold text-rose-900 shadow-none hover:bg-rose-200/70">
          저장하기
        </Button>
      </DialogFooter>
    </>
  )
}

export function RenameCategoryDialog({
  categoryId,
  currentName,
  open,
  onOpenChange,
}: RenameCategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-3xl border border-rose-100/70 bg-[#fffdfd] p-6 shadow-[0_24px_80px_-24px_rgba(88,57,77,0.25)] ring-0 sm:max-w-[440px]">
        {open ? (
          <RenameCategoryDialogForm
            key={categoryId}
            categoryId={categoryId}
            initialName={currentName}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

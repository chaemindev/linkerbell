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
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">카테고리명 수정</DialogTitle>
      </DialogHeader>
      <div className="grid gap-5 py-4">
        <div className="grid gap-2">
          <Input
            id="rename-category-name"
            placeholder="이름을 입력하세요"
            className="h-11"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void handleSubmit()}
          />
        </div>
      </div>
      <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="h-11 sm:min-w-[100px]"
          onClick={() => onOpenChange(false)}
        >
          취소
        </Button>
        <Button type="button" onClick={() => void handleSubmit()} className="h-11 bg-slate-900 font-bold sm:min-w-[100px]">
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
      <DialogContent className="sm:max-w-[425px]">
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

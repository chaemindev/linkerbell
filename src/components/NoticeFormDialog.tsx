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

export interface NoticeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  initialContent?: string
  initialAuthor?: string
  onSubmit: (
    content: string,
    author: string,
  ) => Promise<boolean> | boolean
}

export function NoticeFormDialog({
  open,
  onOpenChange,
  mode,
  initialContent = "",
  initialAuthor = "",
  onSubmit,
}: NoticeFormDialogProps) {
  const [content, setContent] = useState(initialContent)
  const [author, setAuthor] = useState(initialAuthor)
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setContent(initialContent)
      setAuthor(initialAuthor)
    }
  }

  const handleSubmit = async () => {
    const c = content.trim()
    if (!c) {
      alert("내용을 입력해 주세요.")
      return
    }
    const ok = await onSubmit(c, author)
    if (ok) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-3xl border border-rose-100/70 bg-[#fffdfd] p-6 shadow-[0_24px_80px_-24px_rgba(88,57,77,0.25)] ring-0 sm:max-w-[440px]">
        <DialogHeader className="border-b border-rose-100/60 pb-4 pr-6">
          <DialogTitle className="text-lg font-semibold tracking-tight text-slate-800">
            {mode === "add" ? "새 공지 작성" : "공지 수정"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-5 py-2">
          <div className="grid gap-2">
            <label htmlFor="notice-content" className="text-xs font-medium text-slate-500">내용</label>
            <textarea
              id="notice-content"
              className="min-h-36 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus-visible:border-rose-200 focus-visible:ring-2 focus-visible:ring-rose-100"
              placeholder="공지할 내용을 입력해 주세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="notice-author" className="text-xs font-medium text-slate-500">작성자</label>
            <Input
              id="notice-author"
              placeholder="예: 채민"
              className="h-11 rounded-xl border-slate-200 bg-white shadow-none placeholder:text-slate-400 focus-visible:border-rose-200 focus-visible:ring-rose-100"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

        </div>
        <DialogFooter className="m-0 flex-row justify-end rounded-none border-0 bg-transparent p-0 pt-3">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-10 rounded-xl px-5 text-slate-500 hover:bg-slate-100">취소</Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            className="h-10 rounded-xl border border-rose-200/60 bg-rose-100 px-6 font-semibold text-rose-900 shadow-none hover:bg-rose-200/70"
          >
            저장하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

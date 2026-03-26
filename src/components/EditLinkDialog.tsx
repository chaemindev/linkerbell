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

export interface EditLinkDialogProps {
  linkId: number
  initialTitle: string
  initialUrl: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function EditLinkDialogForm({
  linkId,
  initialTitle,
  initialUrl,
  onOpenChange,
}: {
  linkId: number
  initialTitle: string
  initialUrl: string
  onOpenChange: (open: boolean) => void
}) {
  const [title, setTitle] = useState(initialTitle)
  const [url, setUrl] = useState(initialUrl)
  const updateLink = useLinkStore((state) => state.updateLink)

  const handleSubmit = async () => {
    const t = title.trim()
    const u = url.trim()
    if (!t) {
      alert("링크 이름을 입력해 주세요.")
      return
    }
    if (!u) {
      alert("URL을 입력해 주세요.")
      return
    }
    const ok = await updateLink(linkId, { title: t, url: u })
    if (ok) onOpenChange(false)
  }

  return (
    <>
      <DialogHeader className="gap-3">
        <DialogTitle className="pb-0 text-xl font-bold leading-tight">링크 수정</DialogTitle>
      </DialogHeader>
      <div className="grid gap-5 py-4">
        <div className="grid gap-2">
          <label htmlFor="edit-link-title" className="text-sm font-semibold text-slate-700">
            링크 타이틀
          </label>
          <Input
            id="edit-link-title"
            placeholder="예: 구글"
            className="h-11"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="edit-link-url" className="text-sm font-semibold text-slate-700">
            URL
          </label>
          <Input
            id="edit-link-url"
            placeholder="google.com"
            className="h-11"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
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

export function EditLinkDialog({
  linkId,
  initialTitle,
  initialUrl,
  open,
  onOpenChange,
}: EditLinkDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-2 sm:max-w-[425px]">
        {open ? (
          <EditLinkDialogForm
            key={linkId}
            linkId={linkId}
            initialTitle={initialTitle}
            initialUrl={initialUrl}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

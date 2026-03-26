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

export type LinkEditField = "title" | "url"

export interface EditLinkFieldDialogProps {
  linkId: number
  field: LinkEditField
  currentValue: string
  linkTitle: string
  linkUrl: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function EditLinkFieldDialogForm({
  linkId,
  field,
  initialValue,
  linkTitle,
  linkUrl,
  onOpenChange,
}: {
  linkId: number
  field: LinkEditField
  initialValue: string
  linkTitle: string
  linkUrl: string
  onOpenChange: (open: boolean) => void
}) {
  const [value, setValue] = useState(initialValue)
  const updateLink = useLinkStore((state) => state.updateLink)

  const handleSubmit = async () => {
    const trimmed = value.trim()
    if (!trimmed) {
      alert(field === "title" ? "링크 이름을 입력해 주세요." : "URL을 입력해 주세요.")
      return
    }
    const ok = await updateLink(linkId, field === "title" ? { title: trimmed } : { url: trimmed })
    if (ok) onOpenChange(false)
  }

  const heading = field === "title" ? "링크 이름 수정" : "URL 수정"
  const placeholder = field === "title" ? "예: 구글" : "google.com"

  return (
    <>
      <DialogHeader className="gap-3">
        <DialogTitle className="pb-5 text-xl font-bold leading-tight">{heading}</DialogTitle>
        {field === "url" && linkTitle.trim() !== "" ? (
          <p className="text-s font-semibold tracking-tight text-slate-800">{linkTitle}</p>
        ) : null}
        {field === "title" && linkUrl.trim() !== "" ? (
          <p className="line-clamp-2 break-all text-xs leading-snug text-slate-500">{linkUrl}</p>
        ) : null}
      </DialogHeader>
      <div className="grid gap-5 pb-4">
        <div className="grid gap-2">
          <Input
            id={`edit-link-${field}`}
            placeholder={placeholder}
            className="h-11"
            value={value}
            onChange={(e) => setValue(e.target.value)}
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

export function EditLinkFieldDialog({
  linkId,
  field,
  currentValue,
  linkTitle,
  linkUrl,
  open,
  onOpenChange,
}: EditLinkFieldDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-2 sm:max-w-[425px]">
        {open ? (
          <EditLinkFieldDialogForm
            key={`${linkId}-${field}`}
            linkId={linkId}
            field={field}
            initialValue={currentValue}
            linkTitle={linkTitle}
            linkUrl={linkUrl}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

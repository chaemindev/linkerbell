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
import { LinkColorPicker } from "@/components/common/LinkColorPicker"
import {
  linkColorToStored,
  storedToLinkColorValue,
  type LinkColorValue,
} from "@/lib/linkColorPalette"
import { isValidUrl } from "@/lib/url"

export interface EditLinkDialogProps {
  linkId: number
  initialTitle: string
  initialUrl: string
  initialColorKey?: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  previewVariant?: "our-bell" | "my-bell"
  onSave: (updates: {
    title: string
    url: string
    colorKey: string | null
  }) => Promise<boolean> | boolean
}

function EditLinkDialogForm({
  initialTitle,
  initialUrl,
  initialColorKey,
  onOpenChange,
  onSave,
  previewVariant = "our-bell",
}: Omit<EditLinkDialogProps, "linkId" | "open">) {
  const [title, setTitle] = useState(initialTitle)
  const [url, setUrl] = useState(initialUrl)
  const [colorValue, setColorValue] = useState<LinkColorValue>(
    storedToLinkColorValue(initialColorKey),
  )

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
    if (!isValidUrl(u)) {
      alert("올바른 URL 형식이 아니에요. 예: example.com")
      return
    }
    const ok = await onSave({
      title: t,
      url: u,
      colorKey: linkColorToStored(colorValue),
    })
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
        <LinkColorPicker
          value={colorValue}
          onChange={setColorValue}
          title={title}
          url={url}
          previewVariant={previewVariant}
        />
      </div>
      <DialogFooter>
        <Button
          type="button"
          onClick={() => void handleSubmit()}
          className="h-11 w-full bg-slate-900 font-bold"
        >
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
  initialColorKey = null,
  open,
  onOpenChange,
  previewVariant = "our-bell",
  onSave,
}: EditLinkDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-2 sm:max-w-[425px]">
        {open ? (
          <EditLinkDialogForm
            key={linkId}
            initialTitle={initialTitle}
            initialUrl={initialUrl}
            initialColorKey={initialColorKey}
            onOpenChange={onOpenChange}
            onSave={onSave}
            previewVariant={previewVariant}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

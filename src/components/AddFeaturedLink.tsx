import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
export interface AddFeaturedLinkProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (title: string, url: string, faviconKey?: string) => Promise<boolean>
}

export function AddFeaturedLink({ open, onOpenChange, onAdd }: AddFeaturedLinkProps) {
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [faviconKey, setFaviconKey] = useState("")
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!open) {
      setTitle("")
      setUrl("")
      setFaviconKey("")
      setPending(false)
    }
  }, [open])

  const handleSubmit = async () => {
    if (pending) return
    setPending(true)
    try {
      const key = faviconKey.trim()
      const ok = await onAdd(title, url, key || undefined)
      if (ok) onOpenChange(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">코어 링크 추가</DialogTitle>
        </DialogHeader>
        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              링크 이름
            </label>
            <Input
              placeholder="예: 구글"
              className="h-11"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              URL
            </label>
            <Input
              placeholder="google.com"
              className="h-11"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              favicon key
              <span className="font-normal text-muted-foreground">(선택)</span>
            </label>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
                public/favicon 경로에 저장될 favicon 이름을 입력해주세요.<br/>
                링크 저장 후 해당경로에 이미지를 저장해주세요.
              </code>
            </p>
            <Input
              placeholder="예: sentry"
              className="h-11 font-mono text-sm"
              value={faviconKey}
              onChange={(e) => setFaviconKey(e.target.value.toLowerCase())}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            disabled={pending}
            onClick={handleSubmit}
            className="h-11 w-full bg-slate-900 text-base font-bold dark:bg-slate-100 dark:text-slate-950"
          >
            {pending ? "저장 중…" : "저장하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

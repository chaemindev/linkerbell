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
  onAdd: (title: string, url: string, iconUrl?: string) => Promise<boolean>
}

export function AddFeaturedLink({ open, onOpenChange, onAdd }: AddFeaturedLinkProps) {
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [iconUrl, setIconUrl] = useState("")
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!open) {
      setTitle("")
      setUrl("")
      setIconUrl("")
      setPending(false)
    }
  }, [open])

  const handleSubmit = async () => {
    if (pending) return
    setPending(true)
    try {
      const icon = iconUrl.trim()
      const ok = await onAdd(title, url, icon || undefined)
      if (ok) onOpenChange(false)
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">스포트라이트 링크 추가</DialogTitle>
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
              아이콘 URL{" "}
              <span className="font-normal text-muted-foreground">(선택)</span>
            </label>
            <Input
              placeholder="https://… 파비콘 이미지 주소"
              className="h-11"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
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

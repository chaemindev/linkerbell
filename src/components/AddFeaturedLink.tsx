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
import { isValidUrl } from "@/lib/url"

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
    if (!isValidUrl(url)) {
      alert("올바른 URL 형식이 아니에요. 예: example.com")
      return
    }
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
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-3xl border border-rose-100/70 bg-[#fffdfd] p-6 shadow-[0_24px_80px_-24px_rgba(88,57,77,0.25)] ring-0 sm:max-w-[440px]">
        <DialogHeader className="border-b border-rose-100/60 pb-4 pr-6">
          <DialogTitle className="text-lg font-semibold tracking-tight text-slate-800">코어 링크 추가</DialogTitle>
        </DialogHeader>
        <div className="grid gap-5 py-2">
          <div className="grid gap-2">
            <label className="text-xs font-medium text-slate-500">
              링크 이름
            </label>
            <Input
              placeholder="예: 구글"
              className="h-11 rounded-xl border-slate-200 bg-white shadow-none placeholder:text-slate-400 focus-visible:border-rose-200 focus-visible:ring-rose-100"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-medium text-slate-500">
              URL
            </label>
            <Input
              placeholder="google.com"
              className="h-11 rounded-xl border-slate-200 bg-white shadow-none placeholder:text-slate-400 focus-visible:border-rose-200 focus-visible:ring-rose-100"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-medium text-slate-500">
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
              className="h-11 rounded-xl border-slate-200 bg-white shadow-none placeholder:text-slate-400 focus-visible:border-rose-200 focus-visible:ring-rose-100 font-mono text-sm"
              value={faviconKey}
              onChange={(e) => setFaviconKey(e.target.value.toLowerCase())}
            />
          </div>
        </div>
        <DialogFooter className="m-0 flex-row justify-end rounded-none border-0 bg-transparent p-0 pt-3">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-10 rounded-xl px-5 text-slate-500 hover:bg-slate-100">취소</Button>
          <Button
            type="button"
            disabled={pending}
            onClick={handleSubmit}
            className="h-10 rounded-xl border border-rose-200/60 bg-rose-100 px-6 font-semibold text-rose-900 shadow-none hover:bg-rose-200/70"
          >
            {pending ? "저장 중…" : "저장하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { useState } from "react"
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
import { LinkColorPicker } from "@/components/common/LinkColorPicker"
import { linkColorToStored, type LinkColorValue } from "@/lib/linkColorPalette"
import { Plus } from "lucide-react"
import { isValidUrl } from "@/lib/url"

interface AddLinkDialogProps {
  categoryName: string
  onAdd: (title: string, url: string, colorKey?: string | null) => void
  variant?: "icon"
}

export function AddLinkDialog({ categoryName, onAdd, variant }: AddLinkDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [colorValue, setColorValue] = useState<LinkColorValue>(null)

  const handleSubmit = () => {
    if (!title || !url) {
      alert("입력해주세요.")
      return
    }
    if (!isValidUrl(url)) {
      alert("올바른 URL 형식이 아니에요. 예: example.com")
      return
    }
    onAdd(title, url, linkColorToStored(colorValue))
    setColorValue(null)
    setTitle("")
    setUrl("")
    setOpen(false)
  }

  const triggerBtn =
    variant === "icon" ? (
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-full bg-transparent text-slate-500 hover:bg-transparent hover:text-slate-700 transition-colors"
      >
        <Plus className="h-4 w-4" />
      </Button>
    ) : (
      <Button className="bg-slate-700 hover:bg-slate-950 text-white shadow-md hover:shadow-lg transition-all cursor-pointer rounded-full px-3 h-8 border-none font-bold mb-3">
        <Plus className="w-3 h-3" /> 새 링크 추가
      </Button>
    )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerBtn}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-3xl border border-rose-100/70 bg-[#fffdfd] p-6 shadow-[0_24px_80px_-24px_rgba(88,57,77,0.25)] ring-0 sm:max-w-[440px]">
        <DialogHeader className="border-b border-rose-100/60 pb-4 pr-6">
          <DialogTitle className="text-lg font-semibold tracking-tight text-slate-800">{categoryName} 링크 추가</DialogTitle>
        </DialogHeader>
        <div className="grid gap-5 py-2">
          <div className="grid gap-2">
            <label className="text-xs font-medium text-slate-500">링크 이름</label>
            <Input
              placeholder="예: 구글"
              className="h-11 rounded-xl border-slate-200 bg-white shadow-none placeholder:text-slate-400 focus-visible:border-rose-200 focus-visible:ring-rose-100"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-medium text-slate-500">URL 주소</label>
            <Input
              placeholder="google.com"
              className="h-11 rounded-xl border-slate-200 bg-white shadow-none placeholder:text-slate-400 focus-visible:border-rose-200 focus-visible:ring-rose-100"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </div>
        <LinkColorPicker previewVariant="our-bell" value={colorValue} onChange={setColorValue} title={title} url={url} />
        <DialogFooter className="m-0 flex-row justify-end rounded-none border-0 bg-transparent p-0 pt-3">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="h-10 rounded-xl px-5 text-slate-500 hover:bg-slate-100">취소</Button>
          <Button onClick={handleSubmit} className="h-10 rounded-xl border border-rose-200/60 bg-rose-100 px-6 font-semibold text-rose-900 shadow-none hover:bg-rose-200/70">
            저장하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

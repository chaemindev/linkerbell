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
import { Plus } from "lucide-react"

interface AddLinkDialogProps {
  categoryName: string
  onAdd: (title: string, url: string) => void
  variant?: "icon"
}

export function AddLinkDialog({ categoryName, onAdd, variant }: AddLinkDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")

  const handleSubmit = () => {
    if (!title || !url) {
      alert("입력해주세요.")
      return
    }
    onAdd(title, url)
    setTitle("")
    setUrl("")
    setOpen(false)
  }

  const triggerBtn =
    variant === "icon" ? (
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 rounded-full text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all"
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    ) : (
      <Button className="bg-slate-700 hover:bg-slate-950 text-white shadow-md hover:shadow-lg transition-all cursor-pointer rounded-full px-3 h-8 border-none font-bold mb-3">
        <Plus className="w-3 h-3" /> 새 링크 추가
      </Button>
    )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerBtn}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{categoryName} 링크 추가</DialogTitle>
        </DialogHeader>
        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700">링크 이름</label>
            <Input
              placeholder="예: 구글"
              className="h-11"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700">URL 주소</label>
            <Input
              placeholder="google.com"
              className="h-11"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} className="w-full h-11 text-base font-bold bg-slate-900">
            저장하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

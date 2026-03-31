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
import { FolderPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLinkStore } from "@/store/useLinkStore"

export function AddCategoryDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const addCategory = useLinkStore((state) => state.addCategory)

  const handleSubmit = () => {
    if (!name.trim()) return
    addCategory(name.trim())
    setName("")
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setName("")
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "group relative mb-8 flex h-10 min-w-10 w-10 max-w-10 shrink-0 cursor-pointer items-center overflow-hidden rounded-full border border-violet-200/55 bg-violet-50/95 px-2 text-sm font-semibold tracking-tight text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.05)]",
            "transition-[max-width,box-shadow,background-color,border-color,padding] duration-300 ease-out",
            "hover:w-max hover:max-w-[min(100vw-2rem,28rem)] hover:px-3 hover:border-violet-300/50 hover:bg-violet-100/65 hover:text-slate-800 hover:shadow-[0_0_0_1px_rgba(139,92,246,0.2),0_4px_14px_-4px_rgba(139,92,246,0.18)]",
            "focus-visible:w-max focus-visible:max-w-[min(100vw-2rem,28rem)] focus-visible:px-3 focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-violet-400/35 focus-visible:ring-offset-2",
            "dark:border-violet-800/55 dark:bg-violet-950/35 dark:text-violet-100 dark:hover:bg-violet-900/45",
          )}
        >
          <span
            className={cn(
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left,transform] duration-300 ease-out",
              "group-hover:left-3 group-hover:translate-x-0",
              "group-focus-visible:left-3 group-focus-visible:translate-x-0",
            )}
          >
            <FolderPlus
              className="size-4 shrink-0 text-[#7f749a] dark:text-[#c4b9d6]"
              strokeWidth={2.25}
            />
          </span>
          <span
            className={cn(
              "ml-0 max-w-0 overflow-hidden whitespace-nowrap pl-6 text-left opacity-0",
              "transition-[max-width,opacity] duration-300 ease-out",
              "group-hover:max-w-[min(100vw-2rem,28rem)] group-hover:opacity-100",
              "group-focus-visible:max-w-[min(100vw-2rem,28rem)] group-focus-visible:opacity-100",
              "text-[#7f749a] dark:text-[#c4b9d6]",
            )}
          >
            Add New Category
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">카테고리 추가</DialogTitle>
        </DialogHeader>
        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Input
              placeholder="카테고리 명을 입력해주세요."
              className="h-11"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
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

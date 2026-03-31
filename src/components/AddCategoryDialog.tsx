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

const EXPAND_EASE = "duration-500 ease-out" as const

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
          aria-expanded={open}
          className={cn(
            "group mb-8 flex h-12 shrink-0 cursor-pointer items-center overflow-hidden rounded-full border p-0 text-sm font-semibold tracking-tight",
            "transition-[max-width,gap,padding,box-shadow,background-color,border-color,color]",
            EXPAND_EASE,
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/35 focus-visible:ring-offset-2",
            "dark:border-violet-800/55 dark:text-violet-100",
            open
              ? "justify-start w-max max-w-[min(100vw-2rem,28rem)] gap-0 border-violet-300/50 bg-violet-100/65 pr-[calc(0.75rem+2px)] text-slate-800 shadow-[0_0_0_1px_rgba(139,92,246,0.2),0_4px_14px_-4px_rgba(139,92,246,0.18)] dark:bg-violet-900/45"
              : "w-12 max-w-12 justify-center border-violet-200/55 bg-violet-50/95 text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.05)] dark:bg-violet-950/35 dark:hover:bg-violet-900/45",
            !open &&
              "hover:justify-start hover:w-max hover:max-w-[min(100vw-2rem,28rem)] hover:gap-0 hover:border-violet-300/50 hover:bg-violet-100/65 hover:pr-[calc(0.75rem+2px)] hover:text-slate-800 hover:shadow-[0_0_0_1px_rgba(139,92,246,0.2),0_4px_14px_-4px_rgba(139,92,246,0.18)]",
            !open &&
              "focus-visible:justify-start focus-visible:w-max focus-visible:max-w-[min(100vw-2rem,28rem)] focus-visible:gap-0.5 focus-visible:border-violet-300/50 focus-visible:bg-violet-100/65 focus-visible:pr-[calc(0.75rem+2px)] focus-visible:text-slate-800 focus-visible:shadow-[0_0_0_1px_rgba(139,92,246,0.2),0_4px_14px_-4px_rgba(139,92,246,0.18)]",
          )}
        >
          <span
            className={cn(
              "flex h-full shrink-0 items-center justify-center",
              open ? "w-10" : "w-full group-hover:w-10",
            )}
          >
            <FolderPlus
              className="size-4.5 shrink-0 text-violet-900/90 dark:text-violet-500/90"
              strokeWidth={2.25}
            />
          </span>
          <span
            className={cn(
              "transition-[max-width,opacity]",
              EXPAND_EASE,
              "text-violet-900/90 dark:text-violet-500/90",
              open
                ? "pointer-events-auto static h-auto w-auto max-w-[min(100vw-2rem,28rem)] self-center overflow-visible whitespace-nowrap text-left opacity-100"
                : "pointer-events-none absolute left-0 top-0 h-0 w-0 overflow-hidden whitespace-nowrap text-left opacity-0 group-hover:pointer-events-auto group-hover:static group-hover:h-auto group-hover:w-auto group-hover:max-w-[min(100vw-2rem,28rem)] group-hover:overflow-visible group-hover:opacity-100 group-hover:self-center group-focus-visible:pointer-events-auto group-focus-visible:static group-focus-visible:h-auto group-focus-visible:w-auto group-focus-visible:max-w-[min(100vw-2rem,28rem)] group-focus-visible:overflow-visible group-focus-visible:opacity-100",
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

import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { isCustomLinkColor, normalizeHexColor } from "@/lib/linkColorPalette"
import { NOTICE_COLOR_CHOICES } from "@/lib/noticeColors"
import { cn } from "@/lib/utils"

export interface NoticeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  initialTag?: string
  initialContent?: string
  initialAuthor?: string
  initialColor?: string
  onSubmit: (
    tag: string,
    content: string,
    author: string,
    color: string,
  ) => Promise<boolean> | boolean
}

export function NoticeFormDialog({
  open,
  onOpenChange,
  mode,
  initialTag = "전체",
  initialContent = "",
  initialAuthor = "",
  initialColor = "none",
  onSubmit,
}: NoticeFormDialogProps) {
  const [tag, setTag] = useState(initialTag)
  const [content, setContent] = useState(initialContent)
  const [author, setAuthor] = useState(initialAuthor)
  const [color, setColor] = useState(initialColor)

  const activeCustomHex = isCustomLinkColor(color) ? normalizeHexColor(color) : null
  const [hexDraft, setHexDraft] = useState(activeCustomHex ?? "")
  const [hexError, setHexError] = useState(false)

  useEffect(() => {
    if (!open) return
    setTag(initialTag)
    setContent(initialContent)
    setAuthor(initialAuthor)
    setColor(initialColor)
    const hex = isCustomLinkColor(initialColor) ? normalizeHexColor(initialColor) : null
    setHexDraft(hex ?? "")
    setHexError(false)
  }, [open, initialTag, initialContent, initialAuthor, initialColor])

  const applyHexDraft = (raw: string) => {
    setHexDraft(raw)
    const normalized = normalizeHexColor(raw)
    if (normalized) {
      setHexError(false)
      setColor(normalized)
      return
    }
    if (!raw.trim()) {
      setHexError(false)
      return
    }
    setHexError(true)
  }

  const colorInputValue = activeCustomHex ?? normalizeHexColor(hexDraft) ?? "#E2E8F0"

  const handleSubmit = async () => {
    const c = content.trim()
    if (!c) {
      alert("내용을 입력해 주세요.")
      return
    }
    const ok = await onSubmit(tag, c, author, color)
    if (ok) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {mode === "add" ? "새 메모 작성" : "메모 수정"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700">태그</label>
            <Input
              placeholder="예: CONFLUENCE, 전체"
              className="h-11"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700">내용</label>
            <textarea
              className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="공지할 내용을 입력해 주세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-700">작성자</label>
            <Input
              placeholder="예: 채민"
              className="h-11"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          <div className="grid gap-3">
            <div className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">배경색</span>
              <div className="flex items-center gap-2">
                {NOTICE_COLOR_CHOICES.map((c) => {
                  const selected = color === c.key
                  return (
                    <button
                      key={c.key}
                      type="button"
                      aria-label={c.key === "none" ? "배경색 지정 안 함" : `${c.key} 색상 선택`}
                      onClick={() => setColor(c.key)}
                      style={c.hex ? { backgroundColor: c.hex } : undefined}
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full transition-transform",
                        c.hex == null && "border-2 border-dashed border-slate-300 bg-white",
                        selected ? "ring-2 ring-slate-400 ring-offset-2 scale-105" : "hover:scale-105",
                      )}
                    >
                      {selected ? (
                        <Check
                          className={cn("h-4 w-4", c.hex == null ? "text-slate-500" : "text-white")}
                          strokeWidth={3}
                        />
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-1.5">
              <span className="text-xs font-medium text-slate-500">직접 입력</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label="색상 선택"
                  value={colorInputValue}
                  onChange={(e) => applyHexDraft(e.target.value)}
                  className="size-7 shrink-0 cursor-pointer rounded-md border border-slate-200 bg-white p-0.5"
                />
                <Input
                  placeholder="#FFE4E6"
                  className={cn(
                    "h-8 flex-1 font-mono text-xs",
                    hexError && "border-red-300 focus-visible:ring-red-200",
                  )}
                  value={hexDraft}
                  onChange={(e) => applyHexDraft(e.target.value)}
                  onBlur={() => {
                    const normalized = normalizeHexColor(hexDraft)
                    if (normalized) {
                      setHexDraft(normalized)
                      setHexError(false)
                    }
                  }}
                  maxLength={7}
                />
              </div>
              {hexError ? (
                <p className="text-[11px] text-red-500">#RRGGBB 형식으로 입력해 주세요</p>
              ) : null}
            </div>
          </div>
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
      </DialogContent>
    </Dialog>
  )
}

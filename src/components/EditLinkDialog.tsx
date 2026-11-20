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

export interface EditLinkDialogCategory {
  id: number
  name: string
}

export interface EditLinkDialogProps {
  linkId: number
  initialTitle: string
  initialUrl: string
  initialColorKey?: string | null
  /** 전달하면 "카테고리 이동" 선택 UI가 노출됨 */
  categories?: EditLinkDialogCategory[]
  initialCategoryId?: number
  open: boolean
  onOpenChange: (open: boolean) => void
  previewVariant?: "our-bell" | "my-bell"
  onSave: (updates: {
    title: string
    url: string
    colorKey: string | null
    categoryId?: number
  }) => Promise<boolean> | boolean
}

function EditLinkDialogForm({
  initialTitle,
  initialUrl,
  initialColorKey,
  categories,
  initialCategoryId,
  onOpenChange,
  onSave,
  previewVariant = "our-bell",
}: Omit<EditLinkDialogProps, "linkId" | "open">) {
  const [title, setTitle] = useState(initialTitle)
  const [url, setUrl] = useState(initialUrl)
  const [colorValue, setColorValue] = useState<LinkColorValue>(
    storedToLinkColorValue(initialColorKey),
  )
  const [categoryId, setCategoryId] = useState<number | undefined>(initialCategoryId)

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
      ...(categories && categoryId !== undefined && categoryId !== initialCategoryId
        ? { categoryId }
        : {}),
    })
    if (ok) onOpenChange(false)
  }

  return (
    <>
      <DialogHeader className="border-b border-rose-100/60 pb-4 pr-6">
        <DialogTitle className="pb-0 text-lg font-semibold tracking-tight text-slate-800 leading-tight">링크 수정</DialogTitle>
      </DialogHeader>
      <div className="grid gap-5 py-2">
        <div className="grid gap-2">
          <label htmlFor="edit-link-title" className="text-xs font-medium text-slate-500">
            링크 타이틀
          </label>
          <Input
            id="edit-link-title"
            placeholder="예: 구글"
            className="h-11 rounded-xl border-slate-200 bg-white shadow-none placeholder:text-slate-400 focus-visible:border-rose-200 focus-visible:ring-rose-100"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="edit-link-url" className="text-xs font-medium text-slate-500">
            URL
          </label>
          <Input
            id="edit-link-url"
            placeholder="google.com"
            className="h-11 rounded-xl border-slate-200 bg-white shadow-none placeholder:text-slate-400 focus-visible:border-rose-200 focus-visible:ring-rose-100"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void handleSubmit()}
          />
        </div>
        {categories && categories.length > 0 ? (
          <div className="grid gap-2">
            <label htmlFor="edit-link-category" className="text-xs font-medium text-slate-500">
              카테고리
            </label>
            <select
              id="edit-link-category"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus-visible:border-rose-200 focus-visible:ring-2 focus-visible:ring-rose-100"
              value={categoryId ?? ""}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <LinkColorPicker
          value={colorValue}
          onChange={setColorValue}
          title={title}
          url={url}
          previewVariant={previewVariant}
        />
      </div>
      <DialogFooter className="m-0 flex-row justify-end rounded-none border-0 bg-transparent p-0 pt-3">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-10 rounded-xl px-5 text-slate-500 hover:bg-slate-100">취소</Button>
        <Button
          type="button"
          onClick={() => void handleSubmit()}
          className="h-10 rounded-xl border border-rose-200/60 bg-rose-100 px-6 font-semibold text-rose-900 shadow-none hover:bg-rose-200/70"
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
  categories,
  initialCategoryId,
  open,
  onOpenChange,
  previewVariant = "our-bell",
  onSave,
}: EditLinkDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-3xl border border-rose-100/70 bg-[#fffdfd] p-6 shadow-[0_24px_80px_-24px_rgba(88,57,77,0.25)] ring-0 sm:max-w-[440px]">
        {open ? (
          <EditLinkDialogForm
            key={linkId}
            initialTitle={initialTitle}
            initialUrl={initialUrl}
            initialColorKey={initialColorKey}
            categories={categories}
            initialCategoryId={initialCategoryId}
            onOpenChange={onOpenChange}
            onSave={onSave}
            previewVariant={previewVariant}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

import { useState } from "react"
import { MoreVertical, Trash2, Edit2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AddLinkDialog } from "@/components/AddLinkDialog"
import { RenameCategoryDialog } from "@/components/RenameCategoryDialog"
import { Button } from "@/components/ui/button"

export interface LinkCardHeaderProps {
  categoryId: number
  categoryName: string
  onAddLink: (categoryId: number, title: string, url: string) => void
  onDeleteCategory: (categoryId: number) => void
}

export function LinkCardHeader({
  categoryId,
  categoryName,
  onAddLink,
  onDeleteCategory,
}: LinkCardHeaderProps) {
  const [renameOpen, setRenameOpen] = useState(false)

  return (
    <div className="flex shrink-0 items-center justify-between px-2">
      <div className="flex items-center gap-2">
        <div className="h-4 w-1 rounded-full bg-slate-900" />
        <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">
          {categoryName}
        </h3>
        <AddLinkDialog
          categoryName={categoryName}
          onAdd={(title, url) => onAddLink(categoryId, title, url)}
          variant="icon"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full border-transparent bg-sky-50/90 text-sky-600/90 shadow-[0_1px_2px_rgba(14,165,233,0.12)] transition-all outline-none hover:bg-sky-100 hover:text-sky-700 hover:shadow-[0_2px_8px_rgba(14,165,233,0.18)] focus:border-transparent focus:ring-0 focus-visible:border-transparent focus-visible:ring-0 data-[state=open]:bg-sky-100 data-[state=open]:text-sky-800"
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">카테고리 메뉴</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            className="cursor-pointer gap-2"
            onClick={() => setRenameOpen(true)}
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>이름 수정</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer gap-2 text-red-600 focus:bg-red-50 focus:text-red-600"
            onClick={() => {
              if (
                window.confirm(
                  `'${categoryName}' 카테고리와 내부의 모든 링크가 삭제됩니다. 정말 삭제할까요?`,
                )
              ) {
                onDeleteCategory(categoryId)
              }
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>카테고리 삭제</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenameCategoryDialog
        categoryId={categoryId}
        currentName={categoryName}
        open={renameOpen}
        onOpenChange={setRenameOpen}
      />
    </div>
  )
}

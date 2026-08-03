import { useState } from "react"
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core"
import { GripVertical, Heart, MoreVertical, Trash2, Edit2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AddLinkDialog } from "@/components/AddLinkDialog"
import { RenameCategoryDialog } from "@/components/RenameCategoryDialog"
import { Button } from "@/components/ui/button"
import { getCategoryBadge } from "@/lib/categoryBadge"
import { cn } from "@/lib/utils"

export interface LinkCardHeaderProps {
  categoryId: number
  categoryName: string
  colorIndex: number
  onAddLink: (categoryId: number, title: string, url: string) => void
  onDeleteCategory: (categoryId: number) => void
  /** 카테고리 순서 변경: 타이틀 줄만 드래그 핸들 (@dnd-kit useSortable) */
  categoryDragActivatorNodeRef?: (element: HTMLElement | null) => void
  categoryDragAttributes?: DraggableAttributes
  categoryDragListeners?: DraggableSyntheticListeners | undefined
}

export function LinkCardHeader({
  categoryId,
  categoryName,
  colorIndex,
  onAddLink,
  onDeleteCategory,
  categoryDragActivatorNodeRef,
  categoryDragAttributes,
  categoryDragListeners,
}: LinkCardHeaderProps) {
  const [renameOpen, setRenameOpen] = useState(false)
  const badge = getCategoryBadge(colorIndex)

  const iconBadge = (
    <Heart
      className={cn("mr-2 size-5 shrink-0", badge.color)}
      fill="currentColor"
      strokeWidth={0}
      aria-hidden
    />
  )

  return (
    <div className="group/header flex shrink-0 items-center justify-between px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        {categoryDragActivatorNodeRef != null &&
        categoryDragAttributes != null &&
        categoryDragListeners != null ? (
          <div
            ref={categoryDragActivatorNodeRef}
            className="relative flex min-w-0 cursor-grab touch-manipulation items-center active:cursor-grabbing"
            {...categoryDragAttributes}
            {...categoryDragListeners}
          >
            <GripVertical
              className="absolute -left-5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 shrink-0 text-slate-300 opacity-0 transition-opacity group-hover/header:opacity-100"
              aria-hidden
            />
            {iconBadge}
            <h3 className="min-w-0 truncate text-sm font-black uppercase tracking-tight text-slate-900">
              {categoryName}
            </h3>
          </div>
        ) : (
          <div className="flex min-w-0 items-center">
            {iconBadge}
            <h3 className="min-w-0 truncate text-sm font-black uppercase tracking-tight text-slate-900">
              {categoryName}
            </h3>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-slate-300 opacity-0 transition-all outline-none hover:bg-slate-100 hover:text-slate-500 focus-visible:opacity-100 group-hover/header:opacity-100 data-[state=open]:bg-slate-100 data-[state=open]:text-slate-600 data-[state=open]:opacity-100"
            >
              <MoreVertical className="h-3.5 w-3.5" />
              <span className="sr-only">카테고리 메뉴</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onClick={() => setRenameOpen(true)}
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span className="text-s">카테고리 타이틀 수정</span>
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
              <span className="text-s">카테고리 삭제</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AddLinkDialog
          categoryName={categoryName}
          onAdd={(title, url) => onAddLink(categoryId, title, url)}
          variant="icon"
        />
      </div>

      <RenameCategoryDialog
        categoryId={categoryId}
        currentName={categoryName}
        open={renameOpen}
        onOpenChange={setRenameOpen}
      />
    </div>
  )
}

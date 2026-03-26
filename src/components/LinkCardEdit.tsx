import { Edit2, Link2, MoreHorizontal, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface LinkCardEditProps {
  keepVisible: boolean
  onMenuOpenChange: (open: boolean) => void
  onEditTitle: () => void
  onEditUrl: () => void
  onDelete: () => void
}

export function LinkCardEdit({
  keepVisible,
  onMenuOpenChange,
  onEditTitle,
  onEditUrl,
  onDelete,
}: LinkCardEditProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center pr-3 transition-opacity",
        keepVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100",
      )}
    >
      <DropdownMenu onOpenChange={onMenuOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem className="gap-2" onClick={onEditTitle}>
            <Edit2 className="h-3.5 w-3.5" />
            <span>링크 타이틀 수정</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" onClick={onEditUrl}>
            <Link2 className="h-3.5 w-3.5" />
            <span>URL 수정</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onDelete}
            className="gap-2 text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>삭제</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

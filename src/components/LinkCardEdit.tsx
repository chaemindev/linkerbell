import { Edit2, SquarePen, Trash2 } from "lucide-react"
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
  onEditLink: () => void
  onDelete: () => void
}

export function LinkCardEdit({
  keepVisible,
  onMenuOpenChange,
  onEditLink,
  onDelete,
}: LinkCardEditProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center pr-3 transition-opacity",
        keepVisible
          ? "opacity-100"
          : "opacity-100 md:opacity-0 md:group-hover:opacity-100",
      )}
    >
      <DropdownMenu onOpenChange={onMenuOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-pink-300 transition-colors hover:bg-pink-50/90 hover:text-pink-400 data-[state=open]:bg-pink-50 data-[state=open]:text-pink-400"
          >
            <SquarePen className="h-4 w-4" />
            <span className="sr-only">링크 메뉴</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem className="gap-2" onClick={onEditLink}>
            <Edit2 className="h-3.5 w-3.5" />
            <span>링크 수정</span>
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

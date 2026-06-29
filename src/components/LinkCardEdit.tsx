import { Bell, Edit2, SquarePen, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMyBellStore } from "@/store/useMyBellStore"
import { cn } from "@/lib/utils"

export interface LinkCardEditProps {
  keepVisible: boolean
  onMenuOpenChange: (open: boolean) => void
  onEditLink: () => void
  onDelete: () => void
  link: { title: string; url: string }
}

export function LinkCardEdit({
  keepVisible,
  onMenuOpenChange,
  onEditLink,
  onDelete,
  link,
}: LinkCardEditProps) {
  const myBellCategories = useMyBellStore((s) => s.categories)
  const addToMyBell = useMyBellStore((s) => s.addLink)

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
        <DropdownMenuContent align="end" className="w-44">
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

          <DropdownMenuSeparator />

          {/* 마이벨에 저장하기 */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2">
              <Bell className="h-3.5 w-3.5 text-violet-400" />
              <span>마이벨에 저장</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-40">
              {myBellCategories.length === 0 ? (
                <DropdownMenuItem disabled className="text-xs text-slate-400">
                  마이벨에 카테고리가 없어요
                </DropdownMenuItem>
              ) : (
                myBellCategories.map((cat) => (
                  <DropdownMenuItem
                    key={cat.id}
                    className="gap-2"
                    onClick={() => addToMyBell(cat.id, link.title, link.url)}
                  >
                    <span>{cat.name}</span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

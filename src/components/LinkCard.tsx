import { MoreVertical, Trash2, Edit2, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AddLinkDialog } from "@/components/AddLinkDialog"
import { Button } from "@/components/ui/button"

interface Link {
  id: number
  title: string
  url: string
}

interface LinkCardProps {
  id: number
  name: string
  links: Link[]
  onAddLink: (categoryId: number, title: string, url: string) => void
  onDeleteLink: (linkId: number, title: string) => void
  onDeleteCategory: (categoryId: number) => void
}

export function LinkCard({ id, name, links, onAddLink, onDeleteLink, onDeleteCategory }: LinkCardProps) {

  return (
    <div className="flex flex-col gap-3">
      {/* 카테고리 헤더 영역 */}
      <div className="flex shrink-0 items-center justify-between px-2">
        <div className="flex items-center gap-2">
          {/* 포인트 바 */}
          <div className="w-1 h-4 bg-slate-900 rounded-full" />
          <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">
            {name}
          </h3>
          {/* [추가] 링크 추가 버튼 (작고 직관적인 + 버튼) */}
          <AddLinkDialog
            categoryName={name}
            onAdd={(title: string, url: string) => onAddLink(id, title, url)}
            variant="icon" // 버튼 크기를 작게 조정한 스타일
          />
        </div>

        {/* [더보기] 카테고리 관리 메뉴 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 outline-none">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">카테고리 메뉴</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Edit2 className="h-3.5 w-3.5" />
              <span>이름 수정</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
              onClick={() => {
                if (
                  window.confirm(
                    `'${name}' 카테고리와 내부의 모든 링크가 삭제됩니다. 정말 삭제할까요?`,
                  )
                ) {
                  onDeleteCategory(id)
                }
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>카테고리 삭제</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto">
        {(links ?? [])
          .filter((link) => link?.title != null)
          .map((link, idx) => (
            <li key={link.id > 0 ? link.id : `link-${idx}`} className="overflow-hidden">
              <div className="group flex h-15 min-w-85 shrink-0 items-center overflow-hidden rounded-[40px] border border-slate-50 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)]">
                <a
                  href={link.url ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-0 min-w-0 flex-1 items-center justify-between overflow-hidden px-6 py-4 pr-2"
                >
                  <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-0.5 overflow-hidden pr-2">
                    <span className="line-clamp-1 text-sm tracking-tight text-slate-900 group-hover:text-slate-950">
                      {link.title}
                    </span>
                  </div>
                </a>
                <div className="flex shrink-0 items-center pr-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-slate-200 hover:bg-slate-200/80 hover:text-slate-600 transition-colors"
                  aria-label="링크 삭제"
                  onClick={(e) => {
                    e.preventDefault(); // 링크 이동 방지
                    onDeleteLink(link.id, link.title);
                  }}
                  >
                  <X className="h-4 w-4" /> {/* 클래스는 버튼(부모)에서 제어하므로 단순하게 유지 */}
                </Button>
                </div>
              </div>
            </li>
          ))}
        
        {(links ?? []).length === 0 && (
          <div className="p-8 rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
             <p className="text-xs text-slate-400 italic">저장된 링크가 없어요</p>
          </div>
        )}
      </ul>
    </div>
  )
}
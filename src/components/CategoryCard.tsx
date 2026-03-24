import { ExternalLink } from "lucide-react"
import { AddLinkDialog } from "@/components/AddLinkDialog"

interface Link {
  title: string
  url: string
}

interface CategoryCardProps {
  id: number
  name: string
  links: Link[]
  onAddLink: (categoryId: number, title: string, url: string) => void
}

export function CategoryCard({ id, name, links, onAddLink }: CategoryCardProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* 카테고리 이름  */}
      <div className="flex shrink-0 items-center gap-2 px-2">
        <div className="w-1 h-4 bg-slate-900 rounded-full" />
        <div className="flex items-center justify-between w-full ">
          <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">
            {name}
          </h3>
          <AddLinkDialog
            categoryName={name}
            onAdd={(title: string, url: string) => onAddLink(id, title, url)}
            variant="icon"
          />
        </div>
      </div>

      <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto">
        {(links ?? []).filter((link) => link?.title != null).map((link, idx) => (
          <li key={idx}>
            <a
              href={link.url ?? '#'}
              target="_blank"
              rel="noreferrer"
              className="group flex h-21 shrink-0 items-center justify-between overflow-hidden rounded-[40px] border border-slate-50 bg-[#fff] px-6 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)]"
            >
              {/* 왼쪽 텍스트 영역 */}
              <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-0.5 overflow-hidden pr-2">
                <span className="line-clamp-1 text-sm font-bold tracking-tight text-slate-900 group-hover:text-slate-950">
                  {link.title}
                </span>
                <span className="text-slate-400 text-xs font-medium tracking-tight line-clamp-2 break-all">
                  {(link.url ?? '').replace(/^https?:\/\//, '')}
                </span>
              </div>

              {/* 오른쪽 아이콘 영역 */}
              <div className="p-2 rounded-full bg-slate-50 group-hover:bg-white transition-colors">
                <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-all" />
              </div>
            </a>
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
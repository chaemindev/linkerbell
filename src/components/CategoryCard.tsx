import { ExternalLink } from "lucide-react"

interface Link {
  title: string
  url: string
}

interface CategoryCardProps {
  name: string
  links: Link[]
}

export function CategoryCard({ name, links }: CategoryCardProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* 카테고리 이름  */}
      <div className="flex items-center gap-2 px-4">
        <div className="w-1 h-4 bg-slate-900 rounded-full" />
        <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">
          {name}
        </h3>
      </div>

      <ul className="space-y-3">
        {links.map((link, idx) => (
          <li key={idx}>
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between p-2 px-6 rounded-[40px] bg-[#fff] border border-slate-50 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)] hover:bg-slate-50 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {/* 왼쪽 텍스트 영역 */}
              <div className="flex flex-col">
                <span className="text-slate-900 text-sm font-bold tracking-tight group-hover:text-slate-950">
                  {link.title}
                </span>
                <span className="text-slate-400 text-xs font-medium tracking-tight">
                  {link.url.replace(/^https?:\/\//, '')}
                </span>
              </div>

              {/* 오른쪽 아이콘 영역 */}
              <div className="p-2 rounded-full bg-slate-50 group-hover:bg-white transition-colors">
                <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-all" />
              </div>
            </a>
          </li>
        ))}
        
        {links.length === 0 && (
          <div className="p-8 rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
             <p className="text-xs text-slate-400 italic">저장된 링크가 없어요</p>
          </div>
        )}
      </ul>
    </div>
  )
}
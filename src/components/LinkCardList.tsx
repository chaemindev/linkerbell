import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface LinkCardListItem {
  id: number
  title: string
  url: string
}

export interface LinkCardListProps {
  links: LinkCardListItem[]
  onDeleteLink: (linkId: number, title: string) => void
}

export function LinkCardList({ links, onDeleteLink }: LinkCardListProps) {
  const items = (links ?? []).filter((link) => link?.title != null)

  return (
    <ul className="min-h-0 flex-1 space-y-3 overflow-x-hidden overflow-y-auto">
      {items.map((link, idx) => (
        <li
          key={link.id > 0 ? link.id : `link-${idx}`}
          className="overflow-hidden"
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
              delay: idx * 0.04,
            }}
          >
            <div className="group flex h-15 min-w-85 shrink-0 items-center overflow-hidden rounded-[40px] border border-slate-50 bg-white/70 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
            <a
              href={link.url ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-0 min-w-0 flex-1 items-center justify-between overflow-hidden px-6 py-4 pr-2 "
            >
              <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-0.5 overflow-hidden pr-2">
                <span className="line-clamp-1 text-sm font-medium tracking-tight text-slate-900 group-hover:text-slate-950">
                  {link.title}
                </span>
              </div>
            </a>
            <div className="flex shrink-0 items-center pr-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-slate-200 transition-colors hover:bg-slate-200/80 hover:text-slate-600"
                aria-label="링크 삭제"
                onClick={(e) => {
                  e.preventDefault()
                  onDeleteLink(link.id, link.title)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          </motion.div>
        </li>
      ))}

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-[40px] border-2 border-dashed border-slate-100 p-8">
          <p className="text-xs italic text-slate-400">저장된 링크가 없어요</p>
        </div>
      )}
    </ul>
  )
}

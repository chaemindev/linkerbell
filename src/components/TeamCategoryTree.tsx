import { DebouncedLink } from "@/components/common/DebouncedLink"
import { ChevronRight, Heart, Link2, Plus, ChevronUp, ChevronDown } from "lucide-react"
import { useRef, useState } from "react"
import { AddCategoryDialog } from "@/components/AddCategoryDialog"
import { getCategoryBadge } from "@/lib/categoryBadge"
import { isCustomLinkColor, normalizeHexColor, normalizeLinkColorKey } from "@/lib/linkColorPalette"
import { normalizeLinkHref } from "@/lib/url"
import { useLinkStore } from "@/store/useLinkStore"

const LINK_ICON_COLORS = {
  default: "#94A3B8",
  rose: "#FB7185",
  sky: "#38BDF8",
  violet: "#A78BFA",
  emerald: "#34D399",
  amber: "#FBBF24",
  purple: "#C084FC",
  teal: "#2DD4BF",
}

export function TeamCategoryTree() {
  const [allExpanded, setAllExpandedState] = useState(true)
  const treeRef = useRef<HTMLUListElement>(null)
  const categories = useLinkStore((state) => state.categories)
  const recordLinkClick = useLinkStore((state) => state.recordLinkClick)
  const setAllExpanded = (expanded: boolean) => {
    setAllExpandedState(expanded)
    treeRef.current?.querySelectorAll("details").forEach((details) => {
      details.open = expanded
    })
  }

  return (
    <nav aria-label="카테고리별 링크" className="mt-6">
      <div className="mb-3 flex items-center justify-between gap-2 px-0.5">
      <h2 className="flex items-center gap-2 text-base font-bold text-slate-950">
        <Heart aria-hidden="true" className="h-6 w-6 shrink-0 fill-current text-rose-400" strokeWidth={0} />
        카테고리
      </h2>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={allExpanded ? "카테고리 전체 접기" : "카테고리 전체 펼치기"}
          title={allExpanded ? "전체 접기" : "전체 펼치기"}
          disabled={categories.length === 0}
          onClick={() => setAllExpanded(!allExpanded)}
          className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
        >
          {allExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      <AddCategoryDialog trigger={
        <button
          type="button"
          aria-label="카테고리 추가"
          className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      } />
      </div>
      </div>
      <ul ref={treeRef} className="space-y-1">
        {categories.map((category, index) => (
          <li key={category.id}>
            <details open className="group/category" onToggle={() => {
              const items = treeRef.current?.querySelectorAll("details")
              if (items) setAllExpandedState(Array.from(items).every((item) => item.open))
            }}>
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 [&::-webkit-details-marker]:hidden">
                <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform group-open/category:rotate-90" />
                <Heart aria-hidden="true" className={`h-3.5 w-3.5 shrink-0 fill-current ${getCategoryBadge(index).color}`} />
                <span className="min-w-0 flex-1 truncate font-medium" title={category.name}>{category.name}</span>
                <span className="text-xs tabular-nums text-slate-400">{category.links.length}</span>
              </summary>
              <ul className="mb-2 ml-3.5 space-y-0.5 border-l border-slate-200 pl-2">
                {category.links.map((link) => (
                  <li key={link.id}>
                    <DebouncedLink
                      href={normalizeLinkHref(link.url) ?? undefined}
                      title={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => recordLinkClick(link.id)}
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-slate-400"
                    >
                      <Link2
                        aria-hidden="true"
                        className="h-3 w-3 shrink-0 text-slate-400 opacity-60"
                        style={{ color: isCustomLinkColor(link.color_key)
                          ? normalizeHexColor(link.color_key!) ?? LINK_ICON_COLORS.default
                          : LINK_ICON_COLORS[normalizeLinkColorKey(link.color_key)] }}
                      />
                      <span className="min-w-0 break-words">{link.title}</span>
                    </DebouncedLink>
                  </li>
                ))}
                {category.links.length === 0 && (
                  <li className="px-2 py-2 text-xs text-slate-400">등록된 링크가 없습니다.</li>
                )}
              </ul>
            </details>
          </li>
        ))}
      </ul>
    </nav>
  )
}

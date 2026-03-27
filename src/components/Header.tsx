import { useEffect, useMemo, useRef, useState } from "react"
import { Search } from "lucide-react"
import FairyLogo from "@/components/common/FairyLogo"
import { openLinkInNewTab } from "@/lib/url"
import { useLinkStore } from "@/store/useLinkStore"

type SearchGroup = {
  categoryId: number
  categoryName: string
  links: { id: number; title: string; url: string }[]
}

function buildSearchGroups(
  categories: {
    id: number
    name: string
    links: { id: number; title: string; url: string }[]
  }[],
  query: string,
): SearchGroup[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  return categories
    .map((cat) => {
      const nameMatch = cat.name.toLowerCase().includes(q)
      const linkItems = cat.links.filter((l) => l?.title != null)
      if (nameMatch) return { categoryId: cat.id, categoryName: cat.name, links: linkItems }
      const filteredLinks = linkItems.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          (l.url ?? "").toLowerCase().includes(q),
      )
      if (filteredLinks.length > 0)
        return { categoryId: cat.id, categoryName: cat.name, links: filteredLinks }
      return null
    })
    .filter((c): c is SearchGroup => c !== null)
}

export default function Header() {
  const categories = useLinkStore((s) => s.categories)
  const [query, setQuery] = useState("")
  const [panelOpen, setPanelOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const groups = useMemo(() => buildSearchGroups(categories, query), [categories, query])
  const showPanel = panelOpen && query.trim().length > 0

  useEffect(() => {
    if (!panelOpen) return
    const onDoc = (e: MouseEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return
      setPanelOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [panelOpen])

  useEffect(() => {
    if (!showPanel) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanelOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [showPanel])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="group flex cursor-pointer items-center gap-2.5">
            <FairyLogo />
            <div className="-space-y-0.6 flex flex-col justify-center">
              <h1 className="text-xl font-black tracking-tighter text-foreground">
                LinkerBell
              </h1>
              <h2 className="text-muted-foreground text-[10px] font-bold leading-tight tracking-tight">
                WEB 개발팀 링크요정
              </h2>
            </div>
          </div>
        </div>

        <div
          ref={containerRef}
          className="group relative w-full max-w-[min(100%,18rem)] shrink-0 sm:max-w-xs"
        >
          <span
            className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center transition-colors duration-300 ease-out group-focus-within:text-pink-400/75 dark:group-focus-within:text-pink-300/65"
            aria-hidden
          >
            <Search className="size-4 shrink-0" strokeWidth={2.25} />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setPanelOpen(true)}
            placeholder="검색"
            autoComplete="off"
            className="border-input bg-background placeholder:text-muted-foreground relative z-0 h-10 w-full rounded-full border py-2 pl-9 pr-3 text-sm shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:border-pink-200/70 focus-visible:shadow-[0_0_0_1px_rgba(255,228,235,0.95),0_0_10px_3px_rgba(251,207,216,0.38),0_3px_14px_-5px_rgba(244,194,199,0.3)] dark:focus-visible:border-pink-400/30 dark:focus-visible:shadow-[0_0_0_1px_rgba(251,182,198,0.22),0_0_12px_4px_rgba(236,72,153,0.14),0_4px_16px_-6px_rgba(157,23,77,0.2)]"
            aria-label="링크 검색"
            aria-expanded={showPanel}
            aria-controls="header-search-results"
            aria-autocomplete="list"
          />

          {showPanel ? (
            <div
              id="header-search-results"
              role="listbox"
              className="border-border bg-popover text-popover-foreground absolute left-0 right-0 top-[calc(100%+0.5rem)] z-100 max-h-[min(70vh,22rem)] overflow-y-auto rounded-xl border py-2 shadow-lg"
            >
              {groups.length === 0 ? (
                <p className="text-muted-foreground px-4 py-3 text-center text-sm">
                  검색 결과가 없어요
                </p>
              ) : (
                groups.map((group) => (
                  <div key={group.categoryId} role="presentation">
                    <div className="text-muted-foreground px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide">
                      {group.categoryName}
                    </div>
                    <ul className="pb-2">
                      {group.links.map((link) => (
                        <li key={link.id} role="option">
                          <button
                            type="button"
                            className="hover:bg-accent focus:bg-accent flex w-full px-3 py-2.5 text-left text-sm text-foreground outline-none"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              openLinkInNewTab(link.url)
                              setPanelOpen(false)
                            }}
                          >
                            <span className="line-clamp-2">{link.title}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}

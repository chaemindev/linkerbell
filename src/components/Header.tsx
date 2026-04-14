import { useEffect, useMemo, useRef, useState } from "react"
import { Search } from "lucide-react"
import FairyLogo from "@/components/common/FairyLogo"
import { openLinkInNewTab } from "@/lib/url"
import { cn } from "@/lib/utils"
import { useLinkStore } from "@/store/useLinkStore"

type SearchGroup = {
  categoryId: number
  categoryName: string
  links: { id: number; title: string; url: string }[]
}

const FEATURED_SEARCH_GROUP_ID = -1

function buildSearchGroups(
  categories: {
    id: number
    name: string
    links: { id: number; title: string; url: string }[]
  }[],
  featuredLinks: { id: number; title: string; url: string }[],
  query: string,
): SearchGroup[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const categoryGroups = categories
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

  const featuredMatches = featuredLinks.filter((l) => {
    const t = (l.title ?? "").trim()
    if (!t) return false
    const title = t.toLowerCase()
    const url = (l.url ?? "").toLowerCase()
    return title.includes(q) || url.includes(q)
  })

  if (featuredMatches.length === 0) return categoryGroups

  const featuredGroup: SearchGroup = {
    categoryId: FEATURED_SEARCH_GROUP_ID,
    categoryName: "코어링크",
    links: featuredMatches.map((l) => ({
      id: l.id,
      title: l.title,
      url: l.url,
    })),
  }

  return [featuredGroup, ...categoryGroups]
}

export default function Header() {
  const categories = useLinkStore((s) => s.categories)
  const featuredLinks = useLinkStore((s) => s.featuredLinks)
  const recordLinkClick = useLinkStore((s) => s.recordLinkClick)
  const recordFeaturedLinkClick = useLinkStore((s) => s.recordFeaturedLinkClick)
  const [query, setQuery] = useState("")
  const [searchExpanded, setSearchExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const groups = useMemo(
    () => buildSearchGroups(categories, featuredLinks, query),
    [categories, featuredLinks, query],
  )
  const hasQuery = query.trim().length > 0
  const showPanel = searchExpanded && hasQuery

  useEffect(() => {
    if (!searchExpanded) return
    inputRef.current?.focus()
  }, [searchExpanded])

  useEffect(() => {
    if (!searchExpanded) return
    const onDoc = (e: MouseEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return
      setSearchExpanded(false)
      setQuery("")
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [searchExpanded])

  useEffect(() => {
    if (!searchExpanded) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchExpanded(false)
        setQuery("")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [searchExpanded])

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

        <div ref={containerRef} className="relative shrink-0">
          {/* overflow-hidden은 펼침 클립용으로만 한 줄에 적용. 여기 두면 드롭다운이 잘려 검색이 안 되는 것처럼 보임 */}
          <div
            className={cn(
              "group overflow-hidden rounded-full transition-[max-width,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              searchExpanded
                ? "max-w-[min(100%,18rem)] border border-input bg-background shadow-[0_1px_2px_rgba(15,23,42,0.04)] focus-within:border-pink-200/70 focus-within:shadow-[0_0_0_1px_rgba(255,228,235,0.95),0_0_10px_3px_rgba(251,207,216,0.38),0_3px_14px_-5px_rgba(244,194,199,0.3)] sm:max-w-xs dark:focus-within:border-pink-400/30 dark:focus-within:shadow-[0_0_0_1px_rgba(251,182,198,0.22),0_0_12px_4px_rgba(236,72,153,0.14),0_4px_16px_-6px_rgba(157,23,77,0.2)]"
                : "max-w-10 border-transparent bg-transparent shadow-none",
            )}
          >
            <div className="flex h-10 w-[min(100%,18rem)] max-w-[calc(100vw-2rem)] sm:w-80">
              <button
                type="button"
                className="text-muted-foreground hover:text-pink-400/85 dark:hover:text-pink-300/75 flex h-10 w-10 shrink-0 items-center justify-center transition-colors duration-200 ease-out group-focus-within:text-pink-400/75 focus-visible:outline-none dark:group-focus-within:text-pink-300/65"
                aria-label={searchExpanded ? "검색" : "검색 열기"}
                aria-expanded={searchExpanded}
                onClick={() => {
                  if (!searchExpanded) setSearchExpanded(true)
                  else inputRef.current?.focus()
                }}
              >
                <Search className="size-4 shrink-0" strokeWidth={2.25} />
              </button>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="검색"
                autoComplete="off"
                className={cn(
                  "text-foreground placeholder:text-muted-foreground h-10 min-w-0 flex-1 border-0 bg-transparent py-2 pr-3 text-sm outline-none transition-opacity duration-200 ease-out focus-visible:ring-0 focus-visible:ring-offset-0",
                  searchExpanded
                    ? "pointer-events-auto opacity-100"
                    : "pointer-events-none opacity-0",
                )}
                aria-label="링크 검색"
                aria-expanded={showPanel}
                aria-controls="header-search-results"
                aria-autocomplete="list"
              />
            </div>
          </div>

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
                  <div key={`search-group-${group.categoryId}`} role="presentation">
                    <div className="text-muted-foreground px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide">
                      {group.categoryName}
                    </div>
                    <ul className="pb-2">
                      {group.links.map((link) => (
                        <li key={`${group.categoryId}-${link.id}`} role="option">
                          <button
                            type="button"
                            className="hover:bg-accent focus:bg-accent flex w-full px-3 py-2.5 text-left text-sm text-foreground outline-none"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              if (group.categoryId === FEATURED_SEARCH_GROUP_ID) {
                                recordFeaturedLinkClick(link.id)
                              } else {
                                recordLinkClick(link.id)
                              }
                              openLinkInNewTab(link.url)
                              setSearchExpanded(false)
                              setQuery("")
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

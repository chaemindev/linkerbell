import { useEffect, useMemo, useRef, useState } from "react"
import { Search } from "lucide-react"
import { normalizeLinkHref } from "@/lib/url"
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

export function TeamLinkSearch() {
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
        <div ref={containerRef} className="relative w-full">
          {/* overflow-hidden은 펼침 클립용으로만 한 줄에 적용. 여기 두면 드롭다운이 잘려 검색이 안 되는 것처럼 보임 */}
          <div
            className="group w-full rounded-full border border-input bg-background shadow-sm focus-within:border-pink-200"
          >
            <div className="flex h-8 w-full">
              <button
                type="button"
                className="text-muted-foreground hover:text-pink-400/85 dark:hover:text-pink-300/75 flex h-8 w-10 shrink-0 items-center justify-center transition-colors duration-200 ease-out group-focus-within:text-pink-400/75 focus-visible:outline-none dark:group-focus-within:text-pink-300/65"
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
                onFocus={() => setSearchExpanded(true)}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="링크를 검색 해보세요"
                autoComplete="off"
                className="h-8 min-w-0 flex-1 border-0 bg-transparent py-2 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
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
                          <a
                            href={normalizeLinkHref(link.url) ?? undefined}
                            title={normalizeLinkHref(link.url) ?? link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:bg-accent focus:bg-accent flex w-full px-3 py-2.5 text-left text-sm text-foreground outline-none"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              if (group.categoryId === FEATURED_SEARCH_GROUP_ID) {
                                recordFeaturedLinkClick(link.id)
                              } else {
                                recordLinkClick(link.id)
                              }
                              setSearchExpanded(false)
                              setQuery("")
                            }}
                          >
                            <span className="line-clamp-2">{link.title}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </div>
  )
}

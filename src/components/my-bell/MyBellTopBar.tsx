import { useEffect, useMemo, useRef, useState } from "react"
import { Search } from "lucide-react"
import FairyLogo from "@/components/common/FairyLogo"
import { BellNavButton } from "@/components/common/BellNavButton"
import { useMyBellStore } from "@/store/useMyBellStore"
import { openLinkInNewTab } from "@/lib/url"
import { cn } from "@/lib/utils"

type SearchGroup = {
  categoryId: number
  categoryName: string
  links: { id: number; title: string; url: string }[]
}

function buildSearchGroups(
  categories: { id: number; name: string }[],
  links: { id: number; title: string; url: string; categoryId: number }[],
  query: string,
): SearchGroup[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const slim = (ls: typeof links) => ls.map(({ id, title, url }) => ({ id, title, url }))
  const results: SearchGroup[] = []

  for (const cat of categories) {
    const catLinks = links.filter((l) => l.categoryId === cat.id)
    const nameMatch = cat.name.toLowerCase().includes(q)
    const filteredLinks = catLinks.filter(
      (l) => l.title.toLowerCase().includes(q) || l.url.toLowerCase().includes(q),
    )
    if (nameMatch) {
      results.push({ categoryId: cat.id, categoryName: cat.name, links: slim(catLinks) })
    } else if (filteredLinks.length > 0) {
      results.push({ categoryId: cat.id, categoryName: cat.name, links: slim(filteredLinks) })
    }
  }
  return results
}

export function MyBellTopBar() {
  const categories = useMyBellStore((s) => s.categories)
  const links = useMyBellStore((s) => s.links)
  const recordClick = useMyBellStore((s) => s.recordClick)

  const [query, setQuery] = useState("")
  const [searchExpanded, setSearchExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const groups = useMemo(
    () => buildSearchGroups(categories, links, query),
    [categories, links, query],
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
      {/* 마이벨 전용: 좌측 패딩 제거해 사이드바와 정렬, 우측은 Header와 동일 */}
      <div className="flex h-16 w-full items-center justify-between gap-4 pl-4 pr-4">
        {/* 브랜드 + 우리벨 — 메인 Header와 완전히 동일한 구조 */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="group flex cursor-pointer items-center gap-2.5">
            <FairyLogo />
            <div className="-space-y-0.6 flex flex-col justify-center">
              <h1 className="text-[17px] font-semibold tracking-wide text-foreground">LinkerBell</h1>
              <h2 className="text-muted-foreground/70 text-[9px] font-light uppercase tracking-[0.18em] leading-tight">
                WEB 개발팀 링크요정
              </h2>
            </div>
          </div>
          <BellNavButton myBellActive />
        </div>

        {/* 검색 — useMyBellStore 연동 */}
        <div ref={containerRef} className="relative shrink-0">
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
                placeholder="마이벨 검색"
                autoComplete="off"
                className={cn(
                  "text-foreground placeholder:text-muted-foreground h-10 min-w-0 flex-1 border-0 bg-transparent py-2 pr-3 text-sm outline-none transition-opacity duration-200 ease-out focus-visible:ring-0 focus-visible:ring-offset-0",
                  searchExpanded
                    ? "pointer-events-auto opacity-100"
                    : "pointer-events-none opacity-0",
                )}
                aria-label="마이벨 링크 검색"
                aria-expanded={showPanel}
                aria-controls="mybell-search-results"
                aria-autocomplete="list"
              />
            </div>
          </div>

          {showPanel && (
            <div
              id="mybell-search-results"
              role="listbox"
              className="border-border bg-popover text-popover-foreground absolute left-0 right-0 top-[calc(100%+0.5rem)] z-100 max-h-[min(70vh,22rem)] overflow-y-auto rounded-xl border py-2 shadow-lg"
            >
              {groups.length === 0 ? (
                <p className="text-muted-foreground px-4 py-3 text-center text-sm">
                  검색 결과가 없어요
                </p>
              ) : (
                groups.map((group) => (
                  <div key={`mybell-search-${group.categoryId}`} role="presentation">
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
                              recordClick(link.id)
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
          )}
        </div>
      </div>
    </header>
  )
}

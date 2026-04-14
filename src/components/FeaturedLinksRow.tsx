import { Plus, X } from "lucide-react"
import { faviconPublicUrl } from "@/lib/faviconUrl"
import { openLinkInNewTab } from "@/lib/url"
import { cn } from "@/lib/utils"

/** title+url 기준으로 고정 — 매 렌더마다 바뀌는 진짜 랜덤은 피함 */
/** 파스텔 틴트가 보이도록 색 테 + 배경 살짝 진하게 (회색 테두리 없음) */
const CHIP_BG = [
  "border-rose-200/60 bg-rose-50 text-slate-700 hover:border-rose-300/55 hover:bg-rose-100/70 hover:text-slate-800",
  "border-sky-200/60 bg-sky-50 text-slate-700 hover:border-sky-300/55 hover:bg-sky-100/70 hover:text-slate-800",
  "border-violet-200/55 bg-violet-50 text-slate-700 hover:border-violet-300/50 hover:bg-violet-100/65 hover:text-slate-800",
  "border-emerald-200/55 bg-emerald-50 text-slate-700 hover:border-emerald-300/50 hover:bg-emerald-100/65 hover:text-slate-800",
  "border-amber-200/55 bg-amber-50 text-slate-700 hover:border-amber-300/50 hover:bg-amber-100/65 hover:text-slate-800",
  "border-purple-200/55 bg-purple-50 text-slate-700 hover:border-purple-300/50 hover:bg-purple-100/65 hover:text-slate-800",
  "border-teal-200/55 bg-teal-50 text-slate-700 hover:border-teal-300/50 hover:bg-teal-100/65 hover:text-slate-800",
  "border-orange-200/55 bg-orange-50 text-slate-700 hover:border-orange-300/50 hover:bg-orange-100/65 hover:text-slate-800",
] as const

function fnv1aHash(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

function chipStyleIndex(seed: string): number {
  return fnv1aHash(seed) % CHIP_BG.length
}

/** iconUrl 없을 때 칩 안에 넣을 한 글자 (한글·이모지 1자 단위) */
function titleInitial(title: string): string {
  const t = title.trim()
  if (!t) return "?"
  return Array.from(t)[0] ?? "?"
}

export interface FeaturedLinkItem {
  /** DB row id — 있을 때만 삭제 버튼 표시 */
  id?: number
  title: string
  url: string
  /** `favicon_{key}` 번들 키 — 없거나 매칭 실패 시 title 첫 글자 */
  faviconKey?: string
}

export interface FeaturedLinksRowProps {
  links?: FeaturedLinkItem[]
  /** 스포트라이트 링크 추가 버튼 — 다이얼로그 열기 등 */
  onAddClick?: () => void
  /** `links[].id`가 있을 때 각 칩에 삭제 버튼 표시 */
  onDeleteFeaturedLink?: (linkId: number, title: string) => void
  /** 새 탭으로 열기 직전 (클릭 수 기록 등) */
  onBeforeOpenLink?: (item: FeaturedLinkItem) => void
}

const SECTION_HEADING_ID = "featured-links-heading"

export function FeaturedLinksRow({
  links = [],
  onAddClick,
  onDeleteFeaturedLink,
  onBeforeOpenLink,
}: FeaturedLinksRowProps) {
  const items: FeaturedLinkItem[] = links.slice(0, 10)

  return (
    <section className="mt-12 mb-5" aria-labelledby={SECTION_HEADING_ID}>
      <div className="flex items-center gap-1 border-b border-slate-100/90 pb-3 dark:border-slate-800/80">
        <div
          className="size-1.5 shrink-0 rounded-full bg-[#1B5E4A] dark:bg-emerald-400/80"
          aria-hidden
        />
        <h2
          id={SECTION_HEADING_ID}
          className="inline-flex w-fit items-center rounded-full bg-[#E6F4F1] px-5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1B5E4A] sm:px-3 sm:text-xs dark:bg-emerald-950/55 dark:text-emerald-200/95"
        >
          The Core Link 10
        </h2>
      </div>
      <nav
        className={cn("flex w-full flex-wrap items-center justify-start gap-3 sm:gap-3.5")}
        aria-label="코어 링크 10개 목록"
      >
      {items.map((item) => {
        const seed = `${item.title}\0${item.url}`
        const bgClass = CHIP_BG[chipStyleIndex(seed)]
        const k = item.faviconKey?.trim().toLowerCase()
        const iconSrc = k ? faviconPublicUrl(k) : undefined
        const rowKey = item.id != null ? String(item.id) : `${item.title}-${item.url}`
        const canDelete =
          onDeleteFeaturedLink != null && item.id != null && Number.isFinite(item.id)
        return (
          <div
            key={rowKey}
            className="group/item group/tooltip relative inline-flex touch-manipulation"
          >
            <button
              type="button"
              onClick={() => {
                onBeforeOpenLink?.(item)
                openLinkInNewTab(item.url)
              }}
              className={cn(
                "focus-visible:ring-ring flex size-11 shrink-0 items-center justify-center rounded-full border p-0 text-sm font-medium shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[border-color,background-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:size-12",
                bgClass,
              )}
            >
              {iconSrc && k ? (
                <img
                  src={iconSrc}
                  alt=""
                  className="size-6 shrink-0 rounded-full  border-slate-200/90 bg-white object-contain dark:border-slate-600/60 sm:size-7"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const el = e.currentTarget
                    const isIco = /\.ico(\?|$)/i.test(el.src)
                    if (!isIco) {
                      el.src = `/favicon/${k}.ico`
                      return
                    }
                    el.onerror = null
                  }}
                />
              ) : (
                <span
                  className="select-none text-[15px] font-semibold leading-none sm:text-base"
                  aria-hidden
                >
                  {titleInitial(item.title)}
                </span>
              )}
            </button>
            {canDelete ? (
              <button
                type="button"
                aria-label={`${item.title} 스포트라이트 링크 삭제`}
                className={cn(
                  "focus-visible:ring-ring absolute -top-0.5 -right-0.5 z-[60] flex size-4 items-center justify-center rounded-full border border-slate-200/90 bg-white/95 text-slate-600 shadow-sm transition-[opacity,background-color,color,border-color] duration-200",
                  "hover:border-red-200/90 hover:bg-red-50 hover:text-red-600",
                  "opacity-0 group-hover/item:opacity-100 pointer-coarse:opacity-100",
                  "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  "dark:border-slate-600 dark:bg-slate-900/95 dark:text-slate-300 dark:hover:border-red-400/50 dark:hover:bg-red-950/50 dark:hover:text-red-300",
                )}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const id = item.id
                  if (id != null) onDeleteFeaturedLink(id, item.title)
                }}
              >
                <X className="size-2.5 shrink-0" strokeWidth={2.25} aria-hidden />
              </button>
            ) : null}
            <div
              role="tooltip"
              className="pointer-events-none absolute top-full left-1/2 z-50 mt-2 flex w-max max-w-[min(90vw,20rem)] -translate-x-1/2 flex-col items-center opacity-0 transition-[opacity,transform] duration-200 ease-out -translate-y-1 group-hover/tooltip:translate-y-0 group-hover/tooltip:opacity-100"
            >
              <div className="relative -mb-px flex shrink-0 flex-col items-center" aria-hidden>
                {/* 바깥: 테두리 색 / 안쪽: 배경 — 말풍선 border와 맞춤 */}
                <div className="h-0 w-0 border-x-[9px] border-x-transparent border-b-[9px] border-b-border" />
                <div className="absolute left-1/2 top-px h-0 w-0 -translate-x-1/2 border-x-8 border-x-transparent border-b-8 border-b-popover" />
              </div>
              <div className="rounded-2xl border border-border bg-popover px-3.5 py-2.5 text-center text-sm font-medium leading-snug tracking-tight text-popover-foreground shadow-[0_12px_40px_-10px_rgba(15,23,42,0.18)] ring-1 ring-black/3 dark:shadow-[0_12px_48px_-12px_rgba(0,0,0,0.55)] dark:ring-white/6">
                <span className="whitespace-normal">{item.title}</span>
              </div>
            </div>
          </div>
        )
      })}
        <button
          type="button"
          onClick={() => onAddClick?.()}
          className={cn(
            "focus-visible:ring-ring flex size-11 shrink-0 items-center justify-center rounded-full border border-dashed border-slate-300/90 bg-slate-50/90 text-slate-500 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200 sm:size-12",
          )}
          aria-label="스포트라이트 링크 추가"
        >
          <Plus className="size-5 sm:size-5" strokeWidth={2.2} aria-hidden />
        </button>
      </nav>
    </section>
  )
}

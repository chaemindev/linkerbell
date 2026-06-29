import { MousePointer2 } from "lucide-react"
import { getMyBellLinkCardAppearance } from "@/lib/linkColorPalette"
import { openLinkInNewTab } from "@/lib/url"
import { useMyBellStore } from "@/store/useMyBellStore"
import { cn } from "@/lib/utils"

interface Props {
  id: number
  title: string
  url: string
  clickCount: number
  colorKey?: string | null
  /** 드래그 중 떠 있는 미리보기 */
  dragOverlay?: boolean
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "")
  } catch {
    return url
  }
}

export function MyBellLinkCard({
  id,
  title,
  url,
  clickCount,
  colorKey = null,
  dragOverlay = false,
}: Props) {
  const recordClick = useMyBellStore((s) => s.recordClick)

  const isHot = clickCount >= 30
  const domain = getDomain(url)
  const appearance = getMyBellLinkCardAppearance(colorKey, { dragOverlay })

  return (
    <button
      type="button"
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border px-5 py-2 text-left transition-all duration-200",
        appearance.className,
      )}
      style={{
        ...appearance.style,
        ["--link-title" as string]: appearance.textColors.title,
        ["--link-title-hover" as string]: appearance.textColors.titleHover,
        ["--link-muted" as string]: appearance.textColors.muted,
      }}
      onClick={() => {
        recordClick(id)
        openLinkInNewTab(url)
      }}
    >
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-semibold text-(--link-title) transition-colors group-hover:text-(--link-title-hover)">
          {title}
        </p>
        <p className="line-clamp-1 text-[11px] text-(--link-muted)">{domain}</p>
        <div className="mt-0.5 flex items-center gap-1.5">
          {isHot && (
            <span className="rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-500">
              HOT
            </span>
          )}
          <span className="flex items-center gap-0.5 text-[11px] text-(--link-muted)">
            <MousePointer2 className="h-2.5 w-2.5" />
            {clickCount}
          </span>
        </div>
      </div>
    </button>
  )
}

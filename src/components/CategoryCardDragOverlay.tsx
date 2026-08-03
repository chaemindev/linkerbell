import { GripVertical, Heart } from "lucide-react"
import { LinkRowContent, type LinkCardListItem } from "@/components/LinkCardList"
import { getCategoryBadge } from "@/lib/categoryBadge"
import { cn } from "@/lib/utils"

/** 실제 LinkCard 카드와 동일한 래퍼 스타일 + 드래그 중 살짝 떠 있는 느낌 */
const cardOverlayShell =
  "pointer-events-none min-w-85 max-w-full scale-[1.015] cursor-grabbing rounded-3xl bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_28px_48px_-20px_rgba(15,23,42,0.22)]"

/** 카테고리 카드 드래그 중 ‘떠 있는’ 미리보기 — 실제 LinkCard와 같은 톤앤매너 */
export function CategoryCardDragOverlay({
  categoryName,
  colorIndex = 0,
  links,
}: {
  categoryName: string
  colorIndex?: number
  links: LinkCardListItem[]
}) {
  const items = links.filter((l) => l?.title != null)
  const badge = getCategoryBadge(colorIndex)

  return (
    <div className={cardOverlayShell}>
      <div className="flex flex-col gap-5">
        <div className="flex shrink-0 items-center justify-between px-4">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <GripVertical
                className="h-3.5 w-3.5 shrink-0 text-slate-300"
                aria-hidden
              />
              <Heart
                className={cn("size-5 shrink-0", badge.color)}
                fill="currentColor"
                strokeWidth={0}
                aria-hidden
              />
              <h3 className="min-w-0 truncate text-sm font-black uppercase tracking-tight text-slate-900">
                {categoryName}
              </h3>
            </div>
          </div>
          {/* 메뉴 / 링크 추가 버튼 자리 — 실제 카드와 폭 맞춤 */}
          <div className="flex shrink-0 items-center gap-0.5">
            <div className="h-7 w-7 shrink-0 rounded-full bg-slate-100/50 opacity-50" aria-hidden />
            <div className="h-7 w-7 shrink-0 rounded-full bg-slate-100/50 opacity-50" aria-hidden />
          </div>
        </div>

        {items.length > 0 ? (
          <ul className="min-h-0 list-none space-y-1 overflow-hidden p-0">
            {items.map((link) => (
              <li key={link.id}>
                <LinkRowContent
                  dragOverlay
                  link={link}
                  menuOpenLinkId={null}
                  editingLink={null}
                  setEditingLink={() => {}}
                  setMenuOpenLinkId={() => {}}
                  onDeleteLink={() => {}}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-100 p-8 opacity-90">
            <p className="text-xs italic text-slate-400">저장된 링크가 없어요</p>
          </div>
        )}
      </div>
    </div>
  )
}

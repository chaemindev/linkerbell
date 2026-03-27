import { GripVertical } from "lucide-react"
import { LinkRowContent, type LinkCardListItem } from "@/components/LinkCardList"

/** 링크 행 DragOverlay( Container )와 동일한 래퍼 스타일 */
const linkOverlayShell =
  "pointer-events-none min-w-85 max-w-full scale-[1.015] cursor-grabbing rounded-[40px] shadow-[0_18px_42px_-16px_rgba(240,249,255,0.75),0_10px_22px_-10px_rgba(15,23,42,0.04),0_0_0_1px_rgba(240,249,255,0.65)]"

/** 링크 행 DragOverlay와 같은 ‘떠 있는’ 미리보기 — 카테고리 전체(타이틀+링크) */
export function CategoryCardDragOverlay({
  categoryName,
  links,
}: {
  categoryName: string
  links: LinkCardListItem[]
}) {
  const items = links.filter((l) => l?.title != null)

  return (
    <div className={linkOverlayShell}>
      <div className="flex flex-col gap-3">
        <div className="flex shrink-0 items-center justify-between px-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <GripVertical
                className="h-4 w-4 shrink-0 text-slate-400"
                aria-hidden
              />
              <div className="h-4 w-1 shrink-0 rounded-full bg-slate-900" />
              <h3 className="min-w-0 truncate text-sm font-black uppercase tracking-tight text-slate-900">
                {categoryName}
              </h3>
            </div>
            {/* Add 링크 / 메뉴 자리 — 실제 카드와 폭 맞춤 */}
            <div
              className="h-8 w-8 shrink-0 rounded-full bg-sky-50/50 opacity-50"
              aria-hidden
            />
          </div>
          <div
            className="h-8 w-8 shrink-0 rounded-full bg-sky-50/50 opacity-50"
            aria-hidden
          />
        </div>

        {items.length > 0 ? (
          <ul className="min-h-0 list-none space-y-3 overflow-hidden p-0">
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
          <div className="flex flex-col items-center justify-center rounded-[40px] border-2 border-dashed border-slate-100 p-8 opacity-90">
            <p className="text-xs italic text-slate-400">저장된 링크가 없어요</p>
          </div>
        )}
      </div>
    </div>
  )
}

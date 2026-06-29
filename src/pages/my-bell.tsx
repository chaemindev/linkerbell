import { useMemo, useState } from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import { useMyBellStore } from "@/store/useMyBellStore"
import { MyBellTopBar } from "@/components/my-bell/MyBellTopBar"
import { MyBellSidebar } from "@/components/my-bell/MyBellSidebar"
import { MyBellCategorySection } from "@/components/my-bell/MyBellCategorySection"
import { MyBellLinkCard } from "@/components/my-bell/MyBellLinkCard"
import { CategoryCardDragOverlay } from "@/components/CategoryCardDragOverlay"
import { linkDropAnimation, nestedSortableCollisionDetection } from "@/lib/dndSortable"

export default function MyBell() {
  const categories = useMyBellStore((s) => s.categories)
  const links = useMyBellStore((s) => s.links)
  const addCategory = useMyBellStore((s) => s.addCategory)
  const reorderCategories = useMyBellStore((s) => s.reorderCategories)
  const reorderLinks = useMyBellStore((s) => s.reorderLinks)

  const [activeDragId, setActiveDragId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const colorIndexMap = useMemo(
    () => new Map(categories.map((c, i) => [c.id, i])),
    [categories],
  )

  const categoriesWithLinks = useMemo(
    () =>
      categories.map((cat) => ({
        ...cat,
        // 드래그 정렬 순서를 유지하기 위해 savedAt 정렬 제거
        links: links.filter((l) => l.categoryId === cat.id),
      })),
    [categories, links],
  )

  const recentLinks = useMemo(
    () => [...links].sort((a, b) => b.savedAt - a.savedAt).slice(0, 5),
    [links],
  )

  const sidebarCategories = useMemo(
    () =>
      categoriesWithLinks.map(({ id, name, links: catLinks }) => ({
        id,
        name,
        links: catLinks.map(({ id: lid, title, url }) => ({ id: lid, title, url })),
      })),
    [categoriesWithLinks],
  )

  const categoryReorderEnabled = categories.length > 1

  const overlayCategory =
    activeDragId?.startsWith("category-") && activeDragId
      ? categoriesWithLinks.find(
          (c) => c.id === Number(activeDragId.replace("category-", "")),
        )
      : null

  const overlayLink =
    activeDragId?.startsWith("link-") && activeDragId
      ? links.find((l) => l.id === Number(activeDragId.replace("link-", "")))
      : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id))
  }

  const handleDragCancel = () => {
    setActiveDragId(null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const aid = String(active.id)
    const oid = String(over.id)

    // 카테고리 순서 변경
    if (aid.startsWith("category-") && oid.startsWith("category-")) {
      const activeCatId = Number(aid.replace("category-", ""))
      const overCatId = Number(oid.replace("category-", ""))
      const oldIndex = categories.findIndex((c) => c.id === activeCatId)
      const newIndex = categories.findIndex((c) => c.id === overCatId)
      if (oldIndex < 0 || newIndex < 0) return
      const next = arrayMove(categories, oldIndex, newIndex)
      reorderCategories(next.map((c) => c.id))
      return
    }

    // 링크 순서 변경
    if (aid.startsWith("link-") && oid.startsWith("link-")) {
      const activeLinkId = Number(aid.replace("link-", ""))
      const overLinkId = Number(oid.replace("link-", ""))
      const categoryId = active.data.current?.categoryId as number | undefined
      if (categoryId == null) return
      const catLinks = links.filter((l) => l.categoryId === categoryId)
      const oldIndex = catLinks.findIndex((l) => l.id === activeLinkId)
      const newIndex = catLinks.findIndex((l) => l.id === overLinkId)
      if (oldIndex < 0 || newIndex < 0) return
      const next = arrayMove(catLinks, oldIndex, newIndex)
      reorderLinks(categoryId, next.map((l) => l.id))
    }
  }

  return (
    <div className="flex h-screen flex-col bg-[#FAF5F7]">
      <MyBellTopBar />

      <div className="flex flex-1 overflow-hidden">
        <MyBellSidebar
          categories={sidebarCategories}
          recentLinks={recentLinks}
          onAddCategory={addCategory}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <DndContext
            sensors={sensors}
            collisionDetection={nestedSortableCollisionDetection}
            onDragStart={handleDragStart}
            onDragCancel={handleDragCancel}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={categoriesWithLinks.map((c) => `category-${c.id}`)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-3 gap-8">
                {categoriesWithLinks.map((cat) => (
                  <MyBellCategorySection
                    key={cat.id}
                    id={cat.id}
                    name={cat.name}
                    links={cat.links}
                    colorIndex={colorIndexMap.get(cat.id) ?? 0}
                    categoryReorderEnabled={categoryReorderEnabled}
                  />
                ))}

                {categoriesWithLinks.length === 0 && (
                  <div className="col-span-3 flex h-40 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-sm text-slate-400">
                      사이드바에서 카테고리를 추가해 보세요
                    </p>
                  </div>
                )}
              </div>
            </SortableContext>
            <DragOverlay dropAnimation={linkDropAnimation} zIndex={60}>
              {overlayLink ? (
                <div className="pointer-events-none min-w-[min(100%,20rem)] scale-[1.015] cursor-grabbing">
                  <MyBellLinkCard
                    dragOverlay
                    id={overlayLink.id}
                    title={overlayLink.title}
                    url={overlayLink.url}
                    clickCount={overlayLink.clickCount}
                    colorKey={overlayLink.colorKey}
                  />
                </div>
              ) : overlayCategory ? (
                <CategoryCardDragOverlay
                  categoryName={overlayCategory.name}
                  links={overlayCategory.links.map((l) => ({
                    id: l.id,
                    title: l.title,
                    url: l.url,
                    color_key: l.colorKey ?? null,
                  }))}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </main>
      </div>
    </div>
  )
}

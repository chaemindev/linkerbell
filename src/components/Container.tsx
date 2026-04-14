import { useEffect, useState } from "react"
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
import { AddCategoryDialog } from "@/components/AddCategoryDialog"
import { CategoryCardDragOverlay } from "@/components/CategoryCardDragOverlay"
import { LinkRowContent, type LinkCardListItem } from "@/components/LinkCardList"
import { linkDropAnimation, nestedSortableCollisionDetection } from "@/lib/dndSortable"
import { SortableCategoryCard } from "@/components/SortableCategoryCard"
import { AddFeaturedLink } from "@/components/AddFeaturedLink"
import { FeaturedLinksRow } from "@/components/FeaturedLinksRow"
import { PageTitle } from "./PageTitle"
import { useLinkStore } from "@/store/useLinkStore"

function findLinkInCategories(
  categories: { id: number; links: { id: number; title: string; url: string }[] }[],
  linkId: number,
): LinkCardListItem | null {
  for (const c of categories) {
    const link = c.links.find((l) => l.id === linkId)
    if (link) {
      return { id: link.id, title: link.title, url: link.url }
    }
  }
  return null
}

export function Container() {
  const categories = useLinkStore((state) => state.categories)
  const featuredLinks = useLinkStore((state) => state.featuredLinks)
  const fetchCategories = useLinkStore((state) => state.fetchCategories)
  const fetchFeaturedLinks = useLinkStore((state) => state.fetchFeaturedLinks)
  const addFeaturedLink = useLinkStore((state) => state.addFeaturedLink)
  const deleteFeaturedLink = useLinkStore((state) => state.deleteFeaturedLink)
  const addLink = useLinkStore((state) => state.addLink)
  const deleteLink = useLinkStore((state) => state.deleteLink)
  const reorderLinks = useLinkStore((state) => state.reorderLinks)
  const reorderCategories = useLinkStore((state) => state.reorderCategories)
  const deleteCategory = useLinkStore((state) => state.deleteCategory)
  const recordFeaturedLinkClick = useLinkStore((state) => state.recordFeaturedLinkClick)

  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [overlayMenuOpen, setOverlayMenuOpen] = useState<number | null>(null)
  const [overlayEditing, setOverlayEditing] = useState<LinkCardListItem | null>(null)
  const [addFeaturedOpen, setAddFeaturedOpen] = useState(false)

  useEffect(() => {
    void Promise.all([fetchCategories(), fetchFeaturedLinks()])
  }, [fetchCategories, fetchFeaturedLinks])

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleAddLink = (categoryId: number, title: string, url: string) => {
    addLink(categoryId, title, url.startsWith("http") ? url : `https://${url}`)
  }

  const handleDeleteLink = (linkId: number, title: string) => {
    if (!window.confirm(`${title} 링크를 삭제할까요?`)) return
    void deleteLink(linkId)
  }

  const handleDeleteFeaturedLink = (linkId: number, title: string) => {
    if (!window.confirm(`${title} 스포트라이트 링크를 삭제할까요?`)) return
    void deleteFeaturedLink(linkId)
  }

  const handleDeleteCategory = (categoryId: number) => {
    void deleteCategory(categoryId)
  }

  const handleReorderLinks = (categoryId: number, orderedLinkIds: number[]) => {
    void reorderLinks(categoryId, orderedLinkIds)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id))
  }

  const handleDragCancel = () => {
    setActiveDragId(null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null)
    const { active, over } = event
    if (!over) return

    const aid = String(active.id)
    const oid = String(over.id)
    if (aid === oid) return

    if (aid.startsWith("category-")) {
      if (!oid.startsWith("category-")) return
      const activeCatId = Number(aid.replace("category-", ""))
      const overCatId = Number(oid.replace("category-", ""))
      if (!Number.isFinite(activeCatId) || !Number.isFinite(overCatId)) return
      const oldIndex = categories.findIndex((c) => c.id === activeCatId)
      const newIndex = categories.findIndex((c) => c.id === overCatId)
      if (oldIndex < 0 || newIndex < 0) return
      const next = arrayMove(categories, oldIndex, newIndex)
      void reorderCategories(next.map((c) => c.id))
      return
    }

    if (aid.startsWith("link-")) {
      if (!oid.startsWith("link-")) return
      const activeLinkId = Number(aid.replace("link-", ""))
      const overLinkId = Number(oid.replace("link-", ""))
      if (!Number.isFinite(activeLinkId) || !Number.isFinite(overLinkId)) return

      const categoryId = active.data.current?.categoryId as number | undefined
      if (categoryId == null) return

      const cat = categories.find((c) => c.id === categoryId)
      if (!cat) return
      const linkItems = cat.links.filter((l) => l?.title != null)
      if (linkItems.length < 2) return
      if (!cat.links.some((l) => l.id === overLinkId)) return

      const oldIndex = linkItems.findIndex((l) => l.id === activeLinkId)
      const newIndex = linkItems.findIndex((l) => l.id === overLinkId)
      if (oldIndex < 0 || newIndex < 0) return

      const next = arrayMove(linkItems, oldIndex, newIndex)
      void reorderLinks(
        categoryId,
        next.map((l) => l.id),
      )
    }
  }

  const categorySortableIds = categories.map((c) => `category-${c.id}`)
  const categoryReorderEnabled = categories.length > 1

  const overlayLink =
    activeDragId?.startsWith("link-") && activeDragId
      ? findLinkInCategories(categories, Number(activeDragId.replace("link-", "")))
      : null

  const overlayCategory =
    activeDragId?.startsWith("category-") && activeDragId
      ? categories.find((c) => c.id === Number(activeDragId.replace("category-", "")))
      : null

  const grid = (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <SortableCategoryCard
          key={category.id}
          category={category}
          categoryReorderEnabled={categoryReorderEnabled}
          onAddLink={handleAddLink}
          onDeleteLink={handleDeleteLink}
          onReorderLinks={handleReorderLinks}
          onDeleteCategory={handleDeleteCategory}
        />
      ))}
    </div>
  )

  return (
    <main className="mx-auto max-w-7xl flex-1 px-6 py-12">
      <PageTitle />
      <FeaturedLinksRow
        links={
          featuredLinks.length > 0
            ? featuredLinks.map((link) => ({
                id: link.id,
                title: link.title,
                url: link.url,
                faviconKey: link.faviconKey?.trim() || undefined,
              }))
            : undefined
        }
        onAddClick={() => setAddFeaturedOpen(true)}
        onDeleteFeaturedLink={handleDeleteFeaturedLink}
        onBeforeOpenLink={(item) => {
          if (item.id != null && Number.isFinite(item.id)) recordFeaturedLinkClick(item.id)
        }}
      />
      <AddFeaturedLink
        open={addFeaturedOpen}
        onOpenChange={setAddFeaturedOpen}
        onAdd={addFeaturedLink}
      />
      <div className="mb-0 flex justify-end">
        <AddCategoryDialog />
      </div>

      {categories.length === 0 ? (
        grid
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={nestedSortableCollisionDetection}
          onDragStart={handleDragStart}
          onDragCancel={handleDragCancel}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={categorySortableIds} strategy={rectSortingStrategy}>
            {grid}
          </SortableContext>
          <DragOverlay dropAnimation={linkDropAnimation} zIndex={60}>
            {overlayLink ? (
              <div className="pointer-events-none min-w-85 scale-[1.015] cursor-grabbing rounded-[40px] shadow-[0_18px_42px_-16px_rgba(240,249,255,0.75),0_10px_22px_-10px_rgba(15,23,42,0.04),0_0_0_1px_rgba(240,249,255,0.65)]">
                <LinkRowContent
                  dragOverlay
                  link={overlayLink}
                  menuOpenLinkId={overlayMenuOpen}
                  editingLink={overlayEditing}
                  setEditingLink={setOverlayEditing}
                  setMenuOpenLinkId={setOverlayMenuOpen}
                  onDeleteLink={() => {}}
                />
              </div>
            ) : overlayCategory ? (
              <CategoryCardDragOverlay
                categoryName={overlayCategory.name}
                links={overlayCategory.links.map((l) => ({
                  id: l.id,
                  title: l.title,
                  url: l.url,
                }))}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </main>
  )
}

import type { CollisionDetection } from "@dnd-kit/core"
import { closestCorners, defaultDropAnimation } from "@dnd-kit/core"

/**
 * 카테고리·링크가 같은 DndContext에 있을 때, 드래그 중인 타입과 다른 Sortable(예: 카테고리
 * 드래그인데 포인터가 이웃 카드의 링크 행 위)이 `over`로 잡히면 순서 변경이 무시된다.
 * 링크가 적은 카드는 카테고리 박스가 낮아 이 현상이 잦다 → 충돌 후보만 같은 접두사로 한정.
 */
export const nestedSortableCollisionDetection: CollisionDetection = (args) => {
  const activeId = String(args.active.id)

  if (activeId.startsWith("category-")) {
    const droppableContainers = args.droppableContainers.filter((c) =>
      String(c.id).startsWith("category-"),
    )
    return closestCorners({ ...args, droppableContainers })
  }

  if (activeId.startsWith("link-")) {
    const droppableContainers = args.droppableContainers.filter((c) =>
      String(c.id).startsWith("link-"),
    )
    return closestCorners({ ...args, droppableContainers })
  }

  return closestCorners(args)
}

/** 드롭 시 오버레이가 제자리로 스냅되는 애니메이션 */
export const linkDropAnimation = {
  ...defaultDropAnimation,
  duration: 380,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const

/** 리스트가 재배열될 때 다른 항목이 부드럽게 밀리는 전환 */
export const sortableTransition = {
  duration: 320,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const

export interface CategoryBadge {
  color: string
}

/** 카테고리 헤더 하트 배지 색상 — 인덱스로 순환 배정 */
export const CATEGORY_BADGES: CategoryBadge[] = [
  { color: "text-sky-400" },
  { color: "text-violet-400" },
  { color: "text-emerald-400" },
  { color: "text-amber-400" },
  { color: "text-rose-400" },
  { color: "text-teal-400" },
  { color: "text-indigo-400" },
  { color: "text-orange-400" },
]

export function getCategoryBadge(index: number): CategoryBadge {
  const len = CATEGORY_BADGES.length
  return CATEGORY_BADGES[((index % len) + len) % len]
}

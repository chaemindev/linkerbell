/**
 * `public/favicon/{키}.png` — 없으면 FeaturedLinksRow에서 `.ico`로 폴백
 */
export function faviconPublicUrl(key: string | undefined | null): string | undefined {
  const k = key?.trim().toLowerCase()
  if (!k) return undefined
  return `/favicon/${k}.png`
}

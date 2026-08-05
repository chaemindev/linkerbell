/** ISO 날짜 문자열 → "오늘"/"어제"/"N일 전" 같은 한국어 상대시간 */
export function toRelativeTimeKo(iso: string): string {
  if (!iso) return ""
  const then = new Date(iso)
  if (Number.isNaN(then.getTime())) return ""

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dayDiff = Math.round(
    (startOfDay(new Date()).getTime() - startOfDay(then).getTime()) / 86_400_000,
  )

  if (dayDiff <= 0) return "오늘"
  if (dayDiff === 1) return "어제"
  if (dayDiff < 7) return `${dayDiff}일 전`
  if (dayDiff < 30) return `${Math.floor(dayDiff / 7)}주 전`
  if (dayDiff < 365) return `${Math.floor(dayDiff / 30)}개월 전`
  return `${Math.floor(dayDiff / 365)}년 전`
}

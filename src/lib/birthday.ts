const seoulDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

export function getSeoulDateKey(now = new Date()): string {
  const parts = seoulDateFormatter.formatToParts(now)
  const value = (type: string) => parts.find((part) => part.type === type)?.value
  return `${value("year")}-${value("month")}-${value("day")}`
}

export function hasBirthdayOn(
  rows: { birthday: string; status?: string | null }[],
  dateKey: string,
): boolean {
  return rows.some((row) => row.status !== "D" && row.birthday.slice(5) === dateKey.slice(5))
}

/** 이 id만 생일 당일이 아니어도, 7일 전부터 이벤트를 보여 준다. */
const EARLY_BIRTHDAY_IDS = new Set([4, 6])
const EARLY_BIRTHDAY_DAYS = 7

function daysUntilMonthDay(birthday: string, dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number)
  const [, birthMonth, birthDay] = birthday.split("-").map(Number)
  const today = Date.UTC(year, month - 1, day)
  let next = Date.UTC(year, birthMonth - 1, birthDay)
  if (next < today) next = Date.UTC(year + 1, birthMonth - 1, birthDay)
  return Math.round((next - today) / 86_400_000)
}

export function showsBirthdayEvent(
  row: { id: number; birthday: string; status?: string | null },
  dateKey: string,
): boolean {
  if (row.status === "D" || !row.birthday) return false
  if (row.birthday.slice(5) === dateKey.slice(5)) return true
  return EARLY_BIRTHDAY_IDS.has(row.id) && daysUntilMonthDay(row.birthday, dateKey) <= EARLY_BIRTHDAY_DAYS
}

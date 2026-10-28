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

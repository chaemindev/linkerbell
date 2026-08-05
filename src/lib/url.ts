export function normalizeLinkHref(raw: string | undefined): string | null {
  const t = raw?.trim() ?? ""
  if (!t) return null
  if (t.startsWith("javascript:")) return t
  return t.startsWith("http://") || t.startsWith("https://") ? t : `https://${t}`
}

const DOMAIN_HOSTNAME_RE =
  /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i

/** 저장 전 URL 정합성 검사 — 프로토콜 없으면 https://를 붙여 판단하고, 도메인 형태(예: example.com)가 아니면 무효 처리 */
export function isValidUrl(raw: string | undefined): boolean {
  const t = raw?.trim() ?? ""
  if (!t) return false
  // 북마클릿(javascript: 스킴)은 도메인 형태가 아니므로 별도 허용
  if (t.startsWith("javascript:")) return t.length > "javascript:".length
  const href = normalizeLinkHref(t)
  if (!href) return false
  try {
    return DOMAIN_HOSTNAME_RE.test(new URL(href).hostname)
  } catch {
    return false
  }
}

export function openLinkInNewTab(raw: string | undefined) {
  const href = normalizeLinkHref(raw)
  if (href) window.open(href, "_blank", "noopener,noreferrer")
}

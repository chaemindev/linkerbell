export function normalizeLinkHref(raw: string | undefined): string | null {
  const t = raw?.trim() ?? ""
  if (!t) return null
  return t.startsWith("http://") || t.startsWith("https://") ? t : `https://${t}`
}

const DOMAIN_HOSTNAME_RE =
  /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i

/** 저장 전 URL 정합성 검사 — 프로토콜 없으면 https://를 붙여 판단하고, 도메인 형태(예: example.com)가 아니면 무효 처리 */
export function isValidUrl(raw: string | undefined): boolean {
  const href = normalizeLinkHref(raw)
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

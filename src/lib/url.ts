export function normalizeLinkHref(raw: string | undefined): string | null {
  const t = raw?.trim() ?? ""
  if (!t) return null
  return t.startsWith("http://") || t.startsWith("https://") ? t : `https://${t}`
}

export function openLinkInNewTab(raw: string | undefined) {
  const href = normalizeLinkHref(raw)
  if (href) window.open(href, "_blank", "noopener,noreferrer")
}

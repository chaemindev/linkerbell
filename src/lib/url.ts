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

const HTTP_URL_RE = /https?:\/\/[^\s<>"']+/gi
const TRAILING_URL_PUNCT_RE = /[.,;:!?)]+$/

export type NoticeTextPart = { type: "text" | "link"; value: string }

function isSafeHttpUrl(raw: string): boolean {
  try {
    const url = new URL(raw)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

const LONG_URL_LENGTH = 40

function decodeUrlPart(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, "%20"))
  } catch {
    return value
  }
}

function readableUrlPiece(value: string): string | null {
  const text = decodeUrlPart(value).trim()
  if (!text || text.length > 32 || /^\d+$/.test(text)) return null
  if (!/[a-zA-Z가-힣]/.test(text)) return null
  return text
}

/** 긴 주소는 화면용 짧은 이름으로 바꾼다. 짧은 주소는 프로토콜만 뺀다. */
export function linkDisplayLabel(href: string): string {
  const bare = href.replace(/^https?:\/\//, "")
  if (href.length <= LONG_URL_LENGTH) return bare

  try {
    const url = new URL(href)
    const hash = readableUrlPiece(url.hash.replace(/^#/, ""))
    if (hash) return hash

    const segments = url.pathname.split("/").filter(Boolean)
    for (let i = segments.length - 1; i >= 0; i--) {
      const piece = readableUrlPiece(segments[i])
      if (piece) return piece
    }

    return url.hostname.replace(/^www\./, "")
  } catch {
    return bare
  }
}

/** 공지 본문에서 http(s) 주소만 링크로 분리한다. 끝의 문장부호는 주소에서 뺀다. */
export function splitHttpLinks(text: string): NoticeTextPart[] {
  const parts: NoticeTextPart[] = []
  const re = new RegExp(HTTP_URL_RE.source, "gi")
  let last = 0

  for (const match of text.matchAll(re)) {
    const start = match.index ?? 0
    let raw = match[0]
    let end = start + raw.length
    const tail = raw.match(TRAILING_URL_PUNCT_RE)?.[0] ?? ""
    if (tail) {
      raw = raw.slice(0, -tail.length)
      end -= tail.length
    }
    if (!raw || !isSafeHttpUrl(raw)) continue
    if (start > last) parts.push({ type: "text", value: text.slice(last, start) })
    parts.push({ type: "link", value: raw })
    last = end
  }

  if (last < text.length) parts.push({ type: "text", value: text.slice(last) })
  return parts.length > 0 ? parts : [{ type: "text", value: text }]
}

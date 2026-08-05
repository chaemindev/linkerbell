import {
  getLinkCardTextColors,
  getRelativeLuminance,
  isCustomLinkColor,
  normalizeHexColor,
} from "@/lib/linkColorPalette"

export interface NoticeColorChoice {
  key: string
  /** null = 배경색 지정 안 함(연회색 테두리) */
  hex: string | null
}

export const NOTICE_COLOR_CHOICES: NoticeColorChoice[] = [
  { key: "none", hex: null },
  { key: "amber", hex: "#FEF3C7" },
  { key: "violet", hex: "#EDE9FE" },
  { key: "rose", hex: "#FFE4E6" },
  { key: "sky", hex: "#E0F2FE" },
  { key: "emerald", hex: "#D1FAE5" },
]

export interface ResolvedNoticeColor {
  bordered: boolean
  bg: string
  textColor: string
  mutedColor: string
  tagBg: string
  tagColor: string
}

const NONE_STYLE: ResolvedNoticeColor = {
  bordered: true,
  bg: "#FFFFFF",
  textColor: "#334155",
  mutedColor: "#64748B",
  tagBg: "#F1F5F9",
  tagColor: "#64748B",
}

/** 프리셋 키("amber" 등) 또는 #RRGGBB 커스텀 값을 받아 렌더링용 스타일로 변환 */
export function resolveNoticeColor(raw: string | null | undefined): ResolvedNoticeColor {
  const value = (raw ?? "").trim()
  if (!value || value === "none") return NONE_STYLE

  const hex = isCustomLinkColor(value)
    ? normalizeHexColor(value)
    : NOTICE_COLOR_CHOICES.find((c) => c.key === value)?.hex ?? null

  if (!hex) return NONE_STYLE

  const text = getLinkCardTextColors(hex)
  const dark = getRelativeLuminance(hex) <= 0.5
  return {
    bordered: false,
    bg: hex,
    textColor: text.title,
    mutedColor: text.muted,
    tagBg: dark ? "rgba(255,255,255,0.2)" : "rgba(15,23,42,0.08)",
    tagColor: text.title,
  }
}

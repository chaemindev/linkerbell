import type { CSSProperties } from "react"

export const LINK_COLOR_KEYS = [
  "default",
  "rose",
  "sky",
  "violet",
  "emerald",
  "amber",
  "purple",
  "teal",
] as const

export type LinkColorKey = (typeof LINK_COLOR_KEYS)[number]

/** null = 기본, preset 키, 또는 #RRGGBB 커스텀 색 */
export type LinkColorValue = string | null

type ColorStyle = {
  swatch: string
  ourBell: { base: string; hover: string }
  myBell: { base: string; hover: string }
}

export const LINK_COLOR_STYLES: Record<LinkColorKey, ColorStyle> = {
  default: {
    swatch: "bg-white border border-slate-200",
    ourBell: {
      base: "border-slate-50 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02),0_8px_30px_-8px_rgba(0,0,0,0.05)]",
      hover:
        "hover:bg-slate-50/80 hover:shadow-[0_2px_4px_rgba(0,0,0,0.03),0_14px_40px_-10px_rgba(0,0,0,0.07)]",
    },
    myBell: {
      base: "border-slate-100 bg-white shadow-sm",
      hover: "hover:border-slate-200 hover:shadow-md",
    },
  },
  rose: {
    swatch: "bg-rose-200",
    ourBell: {
      base: "border-rose-200/60 bg-rose-50 shadow-[0_1px_2px_rgba(251,113,133,0.06),0_8px_30px_-8px_rgba(251,113,133,0.08)]",
      hover: "hover:border-rose-300/55 hover:bg-rose-100/70",
    },
    myBell: {
      base: "border-rose-200/60 bg-rose-50 shadow-sm",
      hover: "hover:border-rose-300/55 hover:bg-rose-100/70",
    },
  },
  sky: {
    swatch: "bg-sky-200",
    ourBell: {
      base: "border-sky-200/60 bg-sky-50 shadow-[0_1px_2px_rgba(14,165,233,0.06),0_8px_30px_-8px_rgba(14,165,233,0.08)]",
      hover: "hover:border-sky-300/55 hover:bg-sky-100/70",
    },
    myBell: {
      base: "border-sky-200/60 bg-sky-50 shadow-sm",
      hover: "hover:border-sky-300/55 hover:bg-sky-100/70",
    },
  },
  violet: {
    swatch: "bg-violet-200",
    ourBell: {
      base: "border-violet-200/55 bg-violet-50 shadow-[0_1px_2px_rgba(139,92,246,0.06),0_8px_30px_-8px_rgba(139,92,246,0.08)]",
      hover: "hover:border-violet-300/50 hover:bg-violet-100/65",
    },
    myBell: {
      base: "border-violet-200/55 bg-violet-50 shadow-sm",
      hover: "hover:border-violet-300/50 hover:bg-violet-100/65",
    },
  },
  emerald: {
    swatch: "bg-emerald-200",
    ourBell: {
      base: "border-emerald-200/55 bg-emerald-50 shadow-[0_1px_2px_rgba(16,185,129,0.06),0_8px_30px_-8px_rgba(16,185,129,0.08)]",
      hover: "hover:border-emerald-300/50 hover:bg-emerald-100/65",
    },
    myBell: {
      base: "border-emerald-200/55 bg-emerald-50 shadow-sm",
      hover: "hover:border-emerald-300/50 hover:bg-emerald-100/65",
    },
  },
  amber: {
    swatch: "bg-amber-200",
    ourBell: {
      base: "border-amber-200/55 bg-amber-50 shadow-[0_1px_2px_rgba(245,158,11,0.06),0_8px_30px_-8px_rgba(245,158,11,0.08)]",
      hover: "hover:border-amber-300/50 hover:bg-amber-100/65",
    },
    myBell: {
      base: "border-amber-200/55 bg-amber-50 shadow-sm",
      hover: "hover:border-amber-300/50 hover:bg-amber-100/65",
    },
  },
  purple: {
    swatch: "bg-purple-200",
    ourBell: {
      base: "border-purple-200/55 bg-purple-50 shadow-[0_1px_2px_rgba(168,85,247,0.06),0_8px_30px_-8px_rgba(168,85,247,0.08)]",
      hover: "hover:border-purple-300/50 hover:bg-purple-100/65",
    },
    myBell: {
      base: "border-purple-200/55 bg-purple-50 shadow-sm",
      hover: "hover:border-purple-300/50 hover:bg-purple-100/65",
    },
  },
  teal: {
    swatch: "bg-teal-200",
    ourBell: {
      base: "border-teal-200/55 bg-teal-50 shadow-[0_1px_2px_rgba(20,184,166,0.06),0_8px_30px_-8px_rgba(20,184,166,0.08)]",
      hover: "hover:border-teal-300/50 hover:bg-teal-100/65",
    },
    myBell: {
      base: "border-teal-200/55 bg-teal-50 shadow-sm",
      hover: "hover:border-teal-300/50 hover:bg-teal-100/65",
    },
  },
}

export function normalizeLinkColorKey(value: unknown): LinkColorKey {
  if (value == null || value === "" || value === "default") return "default"
  if (isCustomLinkColor(value)) return "default"
  if (LINK_COLOR_KEYS.includes(value as LinkColorKey)) return value as LinkColorKey
  return "default"
}

const HEX6 = /^#[0-9A-Fa-f]{6}$/
const HEX3 = /^#[0-9A-Fa-f]{3}$/

/** #RGB / #RRGGBB / RRGGBB → #RRGGBB 또는 null */
export function normalizeHexColor(input: string): string | null {
  const raw = input.trim()
  if (!raw) return null
  let hex = raw.startsWith("#") ? raw : `#${raw}`
  if (HEX3.test(hex)) {
    const h = hex.slice(1)
    hex = `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`
  }
  if (!HEX6.test(hex)) return null
  return hex.toUpperCase()
}

export function isCustomLinkColor(value: unknown): boolean {
  return typeof value === "string" && normalizeHexColor(value) !== null
}

export function isPresetLinkColor(value: string | null | undefined): value is LinkColorKey {
  return value != null && value !== "default" && LINK_COLOR_KEYS.includes(value as LinkColorKey)
}

/** DB·localStorage — default는 null, 커스텀은 #RRGGBB */
export function linkColorToStored(value: LinkColorValue): string | null {
  if (value == null || value === "" || value === "default") return null
  const hex = normalizeHexColor(value)
  if (hex) return hex
  if (LINK_COLOR_KEYS.includes(value as LinkColorKey)) {
    return value === "default" ? null : value
  }
  return null
}

export function storedToLinkColorValue(value: unknown): LinkColorValue {
  if (value == null || value === "" || value === "default") return null
  if (typeof value !== "string") return null
  const hex = normalizeHexColor(value)
  if (hex) return hex
  if (LINK_COLOR_KEYS.includes(value as LinkColorKey)) {
    return value === "default" ? null : value
  }
  return null
}

/** @deprecated linkColorToStored 사용 */
export function linkColorKeyToStored(key: LinkColorKey): string | null {
  return linkColorToStored(key)
}

/** @deprecated storedToLinkColorValue 사용 */
export function storedToLinkColorKey(value: unknown): LinkColorKey {
  return normalizeLinkColorKey(storedToLinkColorValue(value))
}

/** 프리셋 카드 배경 — Tailwind *-50 대표 hex (luminance 계산용) */
const PRESET_BG_HEX: Record<LinkColorKey, string> = {
  default: "#FFFFFF",
  rose: "#FFF1F2",
  sky: "#F0F9FF",
  violet: "#F5F3FF",
  emerald: "#ECFDF5",
  amber: "#FFFBEB",
  purple: "#FAF5FF",
  teal: "#F0FDFA",
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHexColor(hex)
  if (!normalized) return null
  const n = normalized.slice(1)
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  }
}

/** WCAG relative luminance (0 = black, 1 = white) */
export function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 1
  const channel = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const r = channel(rgb.r)
  const g = channel(rgb.g)
  const b = channel(rgb.b)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export type LinkCardTextColors = {
  title: string
  titleHover: string
  muted: string
}

export function getLinkCardTextColors(backgroundHex: string): LinkCardTextColors {
  const darkBg = getRelativeLuminance(backgroundHex) <= 0.5
  if (darkBg) {
    return {
      title: "#F8FAFC",
      titleHover: "#FFFFFF",
      muted: "rgba(226, 232, 240, 0.72)",
    }
  }
  return {
    title: "#0F172A",
    titleHover: "#020617",
    muted: "rgba(100, 116, 139, 0.9)",
  }
}

export function getBackgroundHexForColorKey(colorKey: string | null | undefined): string {
  if (isCustomLinkColor(colorKey)) return normalizeHexColor(colorKey!)!
  return PRESET_BG_HEX[normalizeLinkColorKey(colorKey)]
}

function rgbaFromHex(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

export type LinkCardAppearance = {
  className: string
  style?: CSSProperties
  textColors: LinkCardTextColors
}

const LIGHT_CARD_TEXT = getLinkCardTextColors("#FFFFFF")

function customOurBellAppearance(hex: string, dragOverlay?: boolean): LinkCardAppearance {
  if (dragOverlay) {
    return {
      className:
        "border-sky-50/90 bg-linear-to-br from-white via-white to-sky-50/12 shadow-[0_4px_20px_-4px_rgba(240,249,255,0.85),0_2px_8px_-2px_rgba(224,242,254,0.45)]",
      textColors: LIGHT_CARD_TEXT,
    }
  }
  return {
    className:
      "border shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_30px_-8px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.05),0_14px_40px_-10px_rgba(0,0,0,0.08)]",
    style: {
      backgroundColor: hex,
      borderColor: rgbaFromHex(hex, 0.45),
    },
    textColors: getLinkCardTextColors(hex),
  }
}

function customMyBellAppearance(hex: string, dragOverlay?: boolean): LinkCardAppearance {
  if (dragOverlay) {
    return {
      className:
        "border-slate-200 bg-white shadow-[0_8px_28px_-8px_rgba(15,23,42,0.12),0_2px_8px_-2px_rgba(15,23,42,0.06)]",
      textColors: LIGHT_CARD_TEXT,
    }
  }
  return {
    className: "border shadow-sm hover:shadow-md",
    style: {
      backgroundColor: hex,
      borderColor: rgbaFromHex(hex, 0.45),
    },
    textColors: getLinkCardTextColors(hex),
  }
}

export function getOurBellLinkCardAppearance(
  colorKey: string | null | undefined,
  options?: { dragOverlay?: boolean },
): LinkCardAppearance {
  if (isCustomLinkColor(colorKey)) {
    return customOurBellAppearance(normalizeHexColor(colorKey!)!, options?.dragOverlay)
  }
  const key = normalizeLinkColorKey(colorKey)
  const style = LINK_COLOR_STYLES[key].ourBell
  const bgHex = getBackgroundHexForColorKey(colorKey)
  if (options?.dragOverlay) {
    return {
      className: `${style.base} border-sky-50/90 bg-linear-to-br from-white via-white to-sky-50/12 shadow-[0_4px_20px_-4px_rgba(240,249,255,0.85),0_2px_8px_-2px_rgba(224,242,254,0.45)]`,
      textColors: LIGHT_CARD_TEXT,
    }
  }
  return {
    className: `${style.base} ${style.hover}`,
    textColors: getLinkCardTextColors(bgHex),
  }
}

export function getMyBellLinkCardAppearance(
  colorKey: string | null | undefined,
  options?: { dragOverlay?: boolean },
): LinkCardAppearance {
  if (isCustomLinkColor(colorKey)) {
    return customMyBellAppearance(normalizeHexColor(colorKey!)!, options?.dragOverlay)
  }
  const key = normalizeLinkColorKey(colorKey)
  const style = LINK_COLOR_STYLES[key].myBell
  const bgHex = getBackgroundHexForColorKey(colorKey)
  if (options?.dragOverlay) {
    return {
      className:
        "border-slate-200 bg-white shadow-[0_8px_28px_-8px_rgba(15,23,42,0.12),0_2px_8px_-2px_rgba(15,23,42,0.06)]",
      textColors: LIGHT_CARD_TEXT,
    }
  }
  return {
    className: `${style.base} ${style.hover}`,
    textColors: getLinkCardTextColors(bgHex),
  }
}

export function getOurBellLinkCardClasses(
  colorKey: string | null | undefined,
  options?: { dragOverlay?: boolean },
): string {
  return getOurBellLinkCardAppearance(colorKey, options).className
}

export function getMyBellLinkCardClasses(
  colorKey: string | null | undefined,
  options?: { dragOverlay?: boolean },
): string {
  return getMyBellLinkCardAppearance(colorKey, options).className
}

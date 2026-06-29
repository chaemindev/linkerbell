import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import {
  LINK_COLOR_KEYS,
  LINK_COLOR_STYLES,
  getMyBellLinkCardAppearance,
  getOurBellLinkCardAppearance,
  isCustomLinkColor,
  isPresetLinkColor,
  normalizeHexColor,
  type LinkColorKey,
  type LinkColorValue,
} from "@/lib/linkColorPalette"
import { cn } from "@/lib/utils"

export interface LinkColorPickerProps {
  value: LinkColorValue
  onChange: (value: LinkColorValue) => void
  title: string
  url: string
  previewVariant: "our-bell" | "my-bell"
}

function getDomain(url: string): string {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace("www.", "")
  } catch {
    return url || "example.com"
  }
}

function presetFromValue(value: LinkColorValue): LinkColorKey | null {
  if (value == null) return "default"
  if (isPresetLinkColor(value)) return value
  return null
}

export function LinkColorPicker({
  value,
  onChange,
  title,
  url,
  previewVariant,
}: LinkColorPickerProps) {
  const previewTitle = title.trim() || "링크 이름"
  const previewDomain = getDomain(url.trim() || "example.com")

  const activePreset = presetFromValue(value)
  const activeCustomHex =
    value && isCustomLinkColor(value) ? normalizeHexColor(value)! : null

  const [hexDraft, setHexDraft] = useState(activeCustomHex ?? "")
  const [hexError, setHexError] = useState(false)

  useEffect(() => {
    setHexDraft(activeCustomHex ?? "")
    setHexError(false)
  }, [value, activeCustomHex])

  const appearance =
    previewVariant === "our-bell"
      ? getOurBellLinkCardAppearance(value)
      : getMyBellLinkCardAppearance(value)

  const applyHexDraft = (raw: string) => {
    setHexDraft(raw)
    const normalized = normalizeHexColor(raw)
    if (normalized) {
      setHexError(false)
      onChange(normalized)
      return
    }
    if (!raw.trim()) {
      setHexError(false)
      return
    }
    setHexError(true)
  }

  const colorInputValue = activeCustomHex ?? normalizeHexColor(hexDraft) ?? "#E2E8F0"

  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        <span className="text-sm font-semibold text-slate-700">배경색</span>
        <div className="flex flex-wrap gap-1.5">
          {LINK_COLOR_KEYS.map((key) => {
            const selected = activePreset === key
            return (
              <button
                key={key}
                type="button"
                aria-label={key === "default" ? "기본 색" : `${key} 색`}
                aria-pressed={selected}
                onClick={() => onChange(key === "default" ? null : key)}
                className={cn(
                  "size-5 shrink-0 rounded-full transition-transform outline-none",
                  LINK_COLOR_STYLES[key].swatch,
                  selected
                    ? "ring-2 ring-violet-400 ring-offset-1 scale-105"
                    : "hover:scale-105",
                )}
              />
            )
          })}
        </div>
      </div>

      <div className="grid gap-1.5">
        <span className="text-xs font-medium text-slate-500">직접 입력</span>
        <div className="flex items-center gap-2">
          <input
            type="color"
            aria-label="색상 선택"
            value={colorInputValue}
            onChange={(e) => applyHexDraft(e.target.value)}
            className="size-7 shrink-0 cursor-pointer rounded-md border border-slate-200 bg-white p-0.5"
          />
          <Input
            placeholder="#FFE4E6"
            className={cn(
              "h-8 flex-1 font-mono text-xs",
              hexError && "border-red-300 focus-visible:ring-red-200",
            )}
            value={hexDraft}
            onChange={(e) => applyHexDraft(e.target.value)}
            onBlur={() => {
              const normalized = normalizeHexColor(hexDraft)
              if (normalized) {
                setHexDraft(normalized)
                setHexError(false)
              }
            }}
            maxLength={7}
          />
        </div>
        {hexError ? (
          <p className="text-[11px] text-red-500">#RRGGBB 형식으로 입력해 주세요</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <span className="text-xs font-medium text-slate-500">미리보기</span>
        {previewVariant === "our-bell" ? (
          <div
            className={cn(
              "flex h-15 min-w-0 items-center overflow-hidden rounded-[40px] border px-6 py-4 transition-colors",
              appearance.className,
            )}
            style={{
              ...appearance.style,
              ["--link-title" as string]: appearance.textColors.title,
              ["--link-title-hover" as string]: appearance.textColors.titleHover,
            }}
          >
            <span className="line-clamp-1 text-sm font-medium tracking-tight text-(--link-title)">
              {previewTitle}
            </span>
          </div>
        ) : (
          <div
            className={cn(
              "flex w-full items-center rounded-xl border px-5 py-2 transition-colors",
              appearance.className,
            )}
            style={{
              ...appearance.style,
              ["--link-title" as string]: appearance.textColors.title,
              ["--link-title-hover" as string]: appearance.textColors.titleHover,
              ["--link-muted" as string]: appearance.textColors.muted,
            }}
          >
            <div className="min-w-0">
              <p className="line-clamp-1 text-sm font-semibold text-(--link-title)">{previewTitle}</p>
              <p className="line-clamp-1 text-[11px] text-(--link-muted)">{previewDomain}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

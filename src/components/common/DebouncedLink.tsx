import type { ComponentProps, MouseEvent } from "react"

const LINK_CLICK_DEBOUNCE_MS = 500
const pendingClicks = new Map<string, number>()

function allowLinkClick(event: MouseEvent<HTMLAnchorElement>) {
  if (event.defaultPrevented) return false
  if (!event.currentTarget.hasAttribute("href")) return true

  const href = event.currentTarget.href
  const pendingClick = pendingClicks.get(href)
  window.clearTimeout(pendingClick)
  pendingClicks.set(href, window.setTimeout(() => {
    pendingClicks.delete(href)
  }, LINK_CLICK_DEBOUNCE_MS))

  if (pendingClick === undefined) return true

  event.preventDefault()
  return false
}

export function DebouncedLink({ onClick, onAuxClick, ...props }: ComponentProps<"a">) {
  return (
    <a
      {...props}
      onClick={(event) => {
        if (allowLinkClick(event)) onClick?.(event)
      }}
      onAuxClick={(event) => {
        if (event.button !== 1 || allowLinkClick(event)) onAuxClick?.(event)
      }}
    />
  )
}

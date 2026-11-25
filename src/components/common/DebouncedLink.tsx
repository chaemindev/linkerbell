import type { ComponentProps, MouseEvent } from "react"

const LINK_CLICK_DEBOUNCE_MS = 500
const pendingClicks = new Map<string, number>()
const resumingClicks = new WeakSet<HTMLAnchorElement>()

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

function playLinkBounce(link: HTMLAnchorElement) {
  if (!link.hasAttribute("href") || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return
  }

  return link.animate?.(
    [
      { translate: "0 0", easing: "ease-out" },
      { translate: "0 -6px", offset: 0.35, easing: "ease-in" },
      { translate: "0 0", offset: 0.67, easing: "ease-out" },
      { translate: "0 -2px", offset: 0.81, easing: "ease-in-out" },
      { translate: "0 0" },
    ],
    { duration: 350 },
  )
}

export function DebouncedLink({ onClick, onAuxClick, ...props }: ComponentProps<"a">) {
  return (
    <a
      {...props}
      onClick={(event) => {
        const link = event.currentTarget
        if (resumingClicks.has(link)) {
          onClick?.(event)
          return
        }

        if (!allowLinkClick(event)) return

        const bounce = playLinkBounce(link)
        if (
          bounce && link.target === "_blank" &&
          !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
        ) {
          event.preventDefault()
          // Keep the link visible until its feedback has played, then use native navigation.
          const resumeClick = () => {
            resumingClicks.add(link)
            try {
              link.click()
            } finally {
              resumingClicks.delete(link)
            }
          }
          void bounce.finished.then(resumeClick, resumeClick)
          return
        }

        onClick?.(event)
      }}
      onAuxClick={(event) => {
        if (event.button === 1) {
          if (!allowLinkClick(event)) return
          playLinkBounce(event.currentTarget)
        }
        onAuxClick?.(event)
      }}
    />
  )
}

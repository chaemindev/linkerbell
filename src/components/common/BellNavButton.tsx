import { Button } from "@/components/ui/button"
import { navigate } from "@/lib/navigate"
import { cn } from "@/lib/utils"

interface Props {
  /** true = 현재 마이벨 페이지 → "우리벨"(/)로 이동, false = 메인 페이지 → "마이벨"로 이동 */
  myBellActive?: boolean
  className?: string
}

export function BellNavButton({ myBellActive = false, className }: Props) {
  const target = myBellActive ? "/" : "/my-bell"

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "h-9 shrink-0 gap-1.5 rounded-full px-3 font-semibold transition-all duration-200",
        !myBellActive && [
          "border-violet-200/60 bg-linear-to-r from-violet-50/95 via-purple-50/90 to-pink-50/95 text-violet-600 shadow-[0_1px_3px_rgba(124,58,237,0.06)]",
          "hover:border-violet-300/70 hover:from-violet-100 hover:via-purple-100/95 hover:to-pink-100 hover:text-violet-800",
          "hover:shadow-[0_0_0_1px_rgba(245,243,255,0.9),0_0_12px_4px_rgba(124,58,237,0.14)]",
        ],
        myBellActive && [
          "border-sky-200/60 bg-linear-to-r from-sky-50/95 via-cyan-50/90 to-blue-50/95 text-sky-600 shadow-[0_1px_3px_rgba(14,165,233,0.06)]",
          "hover:border-sky-300/70 hover:from-sky-100 hover:via-cyan-100/95 hover:to-blue-100 hover:text-sky-800",
          "hover:shadow-[0_0_0_1px_rgba(240,249,255,0.9),0_0_12px_4px_rgba(14,165,233,0.14)]",
        ],
        className,
      )}
      aria-label={myBellActive ? "팀 링크 페이지로 이동" : "개인화 페이지로 이동"}
      onClick={() => navigate(target)}
    >
      <span
        className={cn("inline-block text-sm leading-none", !myBellActive && "-scale-x-100")}
        aria-hidden
      >
        {myBellActive ? "🧚" : "🌙"}
      </span>
      <span className="hidden sm:inline">{myBellActive ? "우리벨" : "마이벨"}</span>
    </Button>
  )
}

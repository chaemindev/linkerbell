import FairyLogo from "@/components/common/FairyLogo"
import { BellNavButton } from "@/components/common/BellNavButton"

type HeaderProps = {
  /** 마이벨 페이지에서 현재 위치 표시 */
  myBellActive?: boolean
}

export default function Header({ myBellActive = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="flex h-16 w-full items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="group flex cursor-pointer items-center gap-2.5">
            <FairyLogo />
            <div className="-space-y-0.6 flex flex-col justify-center max-[400px]:hidden">
              <h1 className="text-[17px] font-semibold tracking-wide text-foreground">
                LinkerBell
              </h1>
              <h2 className="text-muted-foreground/70 text-[9px] font-light uppercase tracking-[0.18em] leading-tight">
                WEB 개발팀 링크요정
              </h2>
            </div>
          </div>

          <BellNavButton myBellActive={myBellActive} />
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
        </div>
      </div>
    </header>
  )
}

import { useEffect, useState } from "react"
import birthdayParty from "@/assets/birthday-party.png"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

export function BirthdayGreeting({ names }: { names: string[] }) {
  const [open, setOpen] = useState(true)

  useEffect(() => {
    // const timer = window.setTimeout(() => setOpen(false), 8000)
    // return () => window.clearTimeout(timer)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className="max-h-[90dvh] w-max max-w-none overflow-y-auto gap-4 bg-transparent p-0 shadow-none ring-0 sm:max-w-none"
      >
          <DialogTitle
            className="px-5 text-center sm:px-7"
            style={{ fontFamily: "'Jua', sans-serif" }}
          >
            <span className="block mx-auto mb-3 inline-flex rounded-full bg-pink-100 px-3 py-1 text-[11px] font-extrabold tracking-[0.16em] text-pink-600 text-center">
              HAPPY BIRTHDAY
            </span>
            <span className="block break-keep text-[clamp(3.15rem,7.5vw,2.9rem)] leading-[1.15] font-[1050] tracking-[-0.055em] text-slate-900 text-center">
              <span className="text-pink-500 mr-3">{names.map((name) => `${name}님`).join(", ")}</span>
              생일축하합니다! 🎂
            </span>
            <span className="mt-2 block text-[25px] leading-snug font-semibold tracking-[-0.025em] text-slate-600">
              오늘 하루 행복한 일만 가득하길 💗
            </span>
            <span className="mt-3 block break-keep text-[18px] leading-snug font-medium tracking-[-0.02em] text-slate-500">
              {`${names.map((person) => `${person}님`).join(", ")}께 축하의 메세지를 전해주세요!`}
            </span>
          </DialogTitle>
          <img
            src={birthdayParty}
            alt="파티 모자를 쓴 귀여운 캐릭터들의 생일 축하 그림"
            width={736}
            height={736}
            className="mx-auto block h-auto w-[440px] max-w-full rounded-3xl shadow-xl"
          />
      </DialogContent>
    </Dialog>
  )
}

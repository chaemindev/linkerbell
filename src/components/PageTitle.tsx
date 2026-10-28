import linkerbellImg from "@/assets/linkerbell.png"
import { Sparkles } from 'lucide-react'
import { useBirthdayStore } from '@/store/useBirthdayStore'

const brand = 'LinkerBell'
const letterColors = ['#3b82f6', '#ef4444', '#f59e0b', '#60a5fa', '#22c55e', '#fb7185', '#a78bfa', '#f97316', '#14b8a6', '#f43f5e']

/** Jua 글자 윗선. 박스 바닥 기준 em — 초가 글자 안에 박히지 않게 맞춘 값 */
const letterAscent: Record<string, number> = {
  L: 0.735,
  i: 0.725,
  n: 0.5119,
  k: 0.742,
  e: 0.511,
  r: 0.534,
  B: 0.756,
  l: 0.745,
}

function flameSeat(letter: string) {
  return `${(0.163 + (letterAscent[letter] ?? 0.7)).toFixed(3)}em`
}

/** 원점 (0, 0)이 요정 손. 풍선 줄은 모두 이 점으로 모인다. */
const fairyBalloons = [
  { color: "#fb7185", x: 10, y: -50 },
  { color: "#38bdf8", x: 25, y: -56 },
  { color: "#fbbf24", x: 18, y: -42 },
]

export function PageTitle() {
  const isBirthdayToday = useBirthdayStore((state) => state.isBirthdayToday)
  return (
<div className="flex flex-col items-center justify-center gap-8 mb-5 border-b border-slate-100 group">
  
  {/* [상단]: 텍스트 섹션 (모두 가운데 정렬) */}
  <div className="flex flex-col items-center space-y-2 relative">
    <span className="absolute top-1 -left-7 rotate-[-13deg]">
      {isBirthdayToday && (
        <span aria-hidden className="pointer-events-none absolute bottom-[calc(100%+1px)] left-1/2 -translate-x-1/2">
          <span className="relative block h-[32px] w-[40px] scale-[0.97]">
            <span className="ssg-party-hat absolute inset-x-0 top-2 bottom-0" />
            <span className="absolute -top-1.5 left-1/2 h-[9px] w-[9px] -translate-x-1/2 rounded-full bg-amber-300 ring-1 ring-white" />
            <span className="absolute -bottom-px left-1/2 h-[5px] w-[48px] -translate-x-1/2 rounded-full bg-rose-400" />
          </span>
        </span>
      )}
      <span className="block text-[9px] font-black bg-slate-950 text-white px-1.5 py-0.5 tracking-[0.2em] rounded-sm">
        SSG.COM
      </span>
    </span>

    <h2 className={`flex items-center gap-3 text-4xl font-medium tracking-[-0.005em] text-slate-800/90 leading-none sm:text-[2.7rem] ${isBirthdayToday ? 'pt-10' : 'pt-6'}`}>
      {isBirthdayToday ? (
        <span className="inline-flex items-end whitespace-nowrap text-[3.25rem] sm:text-[3.6rem]" aria-label={brand} style={{ fontFamily: "'Jua', sans-serif" }}>
          {Array.from(brand, (letter, index) => (
            <span
              key={index}
              aria-hidden="true"
              className="birthday-letter relative inline-block"
              style={{ color: letterColors[index % letterColors.length] }}
            >
              {letter}
              <span className="birthday-flame" style={{ bottom: flameSeat(letter), left: letter === "L" ? "calc(50% - 9px)" : letter === "k" ? "calc(50% - 6px)" : "50%", }} />
            </span>
          ))}
        </span>
      ) : brand}
      <div className="group/sparkle relative inline-flex cursor-default items-center justify-center transition-all duration-300 ease-out hover:scale-110 hover:rotate-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-violet-100 bg-[white] p-2 shadow-sm">
          <img
            src={linkerbellImg}
            alt=""
            className="h-full w-full object-contain rotate-10 transition-transform duration-500 group-hover/sparkle:rotate-12 group-hover/sparkle:scale-110"
            aria-hidden
          />
        </div>
        {isBirthdayToday && (
          <span aria-hidden className="pointer-events-none absolute right-[20px] top-[36px] z-10 origin-top-left rotate-[15deg]">
            <svg className="absolute overflow-visible" width="1" height="1">
              {fairyBalloons.map((balloon) => (
                <line
                  key={balloon.color}
                  x1={balloon.x + 3.5}
                  y1={balloon.y + 20}
                  x2="0"
                  y2="0"
                  stroke="#94a3b8"
                  strokeWidth="1"
                />
              ))}
            </svg>
            {fairyBalloons.map((balloon) => (
              <span
                key={balloon.color}
                className="absolute block h-[22px] w-[20px] rounded-[50%] rotate-[30deg]"
                style={{ left: balloon.x, top: balloon.y, backgroundColor: balloon.color }}
              />
            ))}
          </span>
        )}
        <Sparkles
          className="pointer-events-none absolute -right-0.5 -top-0.5 h-4 w-4 text-yellow-400 animate-bounce opacity-80 group-hover:opacity-100 drop-shadow-sm group-hover/sparkle:opacity-100"
          aria-hidden
        />
      </div>
    </h2>
    <div className="flex items-center gap-3">
      <span className="text-[9px] font-medium text-slate-400/80 tracking-[0.3em] uppercase">
       Web Dev Team  LINK ARCHIVE
      </span>
    </div>
  </div>
</div>
  )
}

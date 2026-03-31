import linkerbellImg from "@/assets/linkerbell.png"
import { Sparkles } from 'lucide-react'

export function PageTitle() {
  return (
<div className="flex flex-col items-center justify-center gap-8 mb-5 border-b border-slate-100 group">
  
  {/* [상단]: 텍스트 섹션 (모두 가운데 정렬) */}
  <div className="flex flex-col items-center space-y-2 relative">
    <span className="absolute top-1 -left-7 text-[9px] font-black bg-slate-950 text-white px-1.5 py-0.5 tracking-[0.2em] rounded-sm rotate-[-13deg]">
      SSG.COM
    </span>

    <h2 className="text-5xl font-semibold tracking-[-0.05em] text-slate-950 flex items-center gap-3 leading-none pt-6">
       LinkerBell
      <div className="group/sparkle relative inline-flex cursor-default items-center justify-center transition-all duration-300 ease-out hover:scale-110 hover:rotate-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-violet-100 bg-[white] p-2 shadow-sm">
          <img
            src={linkerbellImg}
            alt=""
            className="h-full w-full object-contain rotate-10 transition-transform duration-500 group-hover/sparkle:rotate-12 group-hover/sparkle:scale-110"
            aria-hidden
          />
        </div>
        <Sparkles
          className="pointer-events-none absolute -right-0.5 -top-0.5 h-4 w-4 text-yellow-400 animate-bounce opacity-80 group-hover:opacity-100 drop-shadow-sm group-hover/sparkle:opacity-100"
          aria-hidden
        />
      </div>
    </h2>
    <div className="flex items-center gap-3">
      <span className="text-[9px] font-bold text-slate-400 tracking-[0.3em] uppercase">
       Web Dev Team  LINK ARCHIVE
      </span>
    </div>
  </div>
</div>
  )
}

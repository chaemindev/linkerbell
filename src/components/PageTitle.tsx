import { Sparkles } from "lucide-react";


export function PageTitle() {
  return (
<div className="flex flex-col items-center justify-center gap-8 mb-2 border-b border-slate-100 group">
  
  {/* [상단]: 텍스트 섹션 (모두 가운데 정렬) */}
  <div className="flex flex-col items-center space-y-2 relative">
    <span className="absolute top-1 -left-7 text-[9px] font-black bg-slate-950 text-white px-1.5 py-0.5 tracking-[0.2em] rounded-sm rotate-[-13deg]">
      SSG.COM
    </span>

    <h2 className="text-5xl font-semibold tracking-[-0.05em] text-slate-950 flex items-center gap-3 leading-none pt-6">
       LinkerBell
      <div className="relative inline-flex items-center justify-center p-2 rounded-[18px] bg-[#A7F3D0] transition-all duration-300 ease-out hover:scale-110 hover:rotate-3 shadow-sm cursor-default overflow-hidden group/sparkle">
        
        {/* 아이콘: 부모(group/sparkle)에 마우스 올리면 회전하고 커짐 */}
        <Sparkles className="w-5 h-5 text-[#064E3B] fill-[#064E3B] rotate-10 transition-transform duration-500 group-hover/sparkle:rotate-45 group-hover/sparkle:scale-110" />
        {/* 호버 시 슥 지나가는 광택 효과  */}
        <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/40 to-transparent -translate-x-full group-hover/sparkle:translate-x-full transition-transform duration-1000" />
        {/* 은은한 배경 오버레이 */}
        <div className="absolute inset-0 bg-[#064E3B]/5 opacity-0 group-hover/sparkle:opacity-100 transition-opacity" />
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

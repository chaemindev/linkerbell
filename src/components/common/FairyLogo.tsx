import { Sparkles } from 'lucide-react'

import linkerbellImg from "@/assets/linkerbell.png"

export default function FairyLogo() {
  return (
<div className="relative flex flex-col items-center justify-center shrink-0 group">
      {/* 1. 동그란 배경과 요정 이미지 */}
      <div className="relative h-13 w-13 rounded-full border-2 border-violet-100 bg-white/80 overflow-hidden shadow-sm transition-transform group-hover:scale-105">
        <img 
          src={linkerbellImg} // 요정 이미지만 있는 파일 경로
          alt="Fairy"
          className="h-full w-full object-contain p-1" 
        />
      </div>

      {/* 2. 요정 머리 위 반짝이 (요청하신 그 코드!) */}
      <Sparkles className="absolute -top-0 -right-1 h-3 w-3 text-yellow-400 animate-bounce opacity-80 group-hover:opacity-100" />
    </div>
  );
}
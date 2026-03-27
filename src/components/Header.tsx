import FairyLogo from '@/components/common/FairyLogo';


export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto">
        
        {/* [왼쪽 섹션]: SSG 로고 & 요정 프로젝트 로고 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <FairyLogo />
            <div className="flex flex-col justify-center -space-y-0.6">
                <h1 className="text-xl font-black tracking-tighter text-foreground">
                LinkerBell
                </h1>
                <h2 className="text-[10px] font-bold tracking-tight text-muted-foreground leading-tight">
                WEB 개발팀 링크요정
                </h2>
            </div>
          </div>
        </div>
      </div> 
    </header>
  );
}
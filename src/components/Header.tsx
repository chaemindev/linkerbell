import { Settings, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

        {/* [오른쪽 섹션]: 알림, 설정, 프로필 */}
        <div className="flex items-center gap-1.5">

          {/* ✨ 요청하신 Settings 버튼 추가 */}
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-violet-600 transition-colors">
            <Settings className="h-5 w-5" />
          </Button>

          <div className="w-px h-4 bg-muted mx-1" /> {/* 얇은 구분선 */}

          {/* 프로필 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 transition-all hover:ring-2 hover:ring-violet-200">
                <Avatar className="h-9 w-9 border border-muted/50">
                  <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                  <AvatarFallback className="bg-violet-50 text-violet-500 font-bold text-[10px]">WEB</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-56 mt-2" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none text-foreground">SSG Web 개발팀 ✨</p>
                  <p className="text-[11px] leading-none text-muted-foreground font-medium">dev.ssg@ssg.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup className="p-1">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4 text-violet-500" />
                  <span className="text-sm font-medium">내 프로필</span>
                </DropdownMenuItem>
                {/* 드롭다운 내부에도 환경설정 링크 유지 */}
                <DropdownMenuItem className="cursor-pointer text-violet-600 font-semibold bg-violet-50/30">
                  <Settings className="mr-2 h-4 w-4" />
                  <span className="text-sm">링커벨 설정 🪄</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span className="text-sm font-medium">로그아웃</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
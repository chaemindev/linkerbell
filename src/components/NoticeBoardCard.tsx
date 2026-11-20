import { useState } from "react"
import { Plus, ArrowRight, Star, Ellipsis } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NoticeFormDialog } from "@/components/NoticeFormDialog"
import { NoticeComments } from "@/components/NoticeComments"
import { splitHttpLinks } from "@/lib/url"
import { useLinkStore } from "@/store/useLinkStore"

const NOTICE_PAGE_SIZE = 3
const NOTICE_DOT_COLORS = [
  "bg-violet-400",
  "bg-rose-400",
  "bg-sky-400",
  "bg-emerald-400",
  "bg-amber-400",
  "bg-teal-400",
]

interface NoticeItemProps {
  id: number
  content: string
  author: string
  color: string
  createdAt: string
}

function NoticeItem({ id, content, author, createdAt }: NoticeItemProps) {
  const updateNotice = useLinkStore((s) => s.updateNotice)
  const deleteNotice = useLinkStore((s) => s.deleteNotice)
  const [editOpen, setEditOpen] = useState(false)
  const colorIndex = Math.abs(Math.imul(id, 2654435761)) % NOTICE_DOT_COLORS.length

  const handleDelete = () => {
    if (window.confirm("이 공지를 삭제할까요?")) {
      void deleteNotice(id)
    }
  }

  return (
    <div
      className="group relative rounded-3xl border border-[#e9eaec] p-5"
      style={{ backgroundColor: "#f8f9fa" }}

    >
      <div className="mb-3 flex items-center justify-between gap-2 text-xs font-medium" style={{ color: "#64748B" }}>
        <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${NOTICE_DOT_COLORS[colorIndex]}`} aria-hidden="true" />
        <time dateTime={createdAt}>
          {new Intl.DateTimeFormat("ko-KR", { month: "2-digit", day: "2-digit", weekday: "short", timeZone: "Asia/Seoul" }).format(new Date(createdAt))}
        </time>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-6 shrink-0 rounded-lg px-2 text-xs bg-white/70 text-slate-500 transition-colors hover:bg-white hover:text-slate-700"
            >
              <Ellipsis className="h-4 w-4 text-slate-400" strokeWidth={2.5} aria-hidden="true" />
              <span className="sr-only">공지 메뉴</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem className="cursor-pointer" onClick={() => setEditOpen(true)}>
              수정
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
              onClick={handleDelete}
            >
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p
        className="min-w-0 whitespace-pre-line break-words text-[14px] font-semibold leading-relaxed"
        style={{ color: "#334155" }}
      >
        {splitHttpLinks(content).map((part, index) =>
          part.type === "link" ? (
            <a
              key={index}
              href={part.value}
              title={part.value}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all decoration-current/40 underline-offset-2 hover:decoration-current"
            >
             🔗 링크 이동하기
            </a>
          ) : (
            <span key={index}>{part.value}</span>
          ),
        )}
      </p>
      <NoticeComments noticeId={id} author={author} />
      <NoticeFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        initialContent={content}
        initialAuthor={author}
        onSubmit={(c, a) => updateNotice(id, { content: c, author: a, color: "none" })}
      />
    </div>
  )
}

export function NoticeBoardCard() {
  const notices = useLinkStore((s) => s.notices)
  const addNotice = useLinkStore((s) => s.addNotice)
  const [addOpen, setAddOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(NOTICE_PAGE_SIZE)

  return (
    <div className="flex flex-col gap-5 rounded-3xl bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_20px_40px_-20px_rgba(15,23,42,0.14)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="size-6 shrink-0 fill-current text-amber-400" strokeWidth={0} aria-hidden="true" />
          <h3 className="text-xl font-bold tracking-tight text-slate-900">공지사항</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="새 공지 작성"
          className="h-9 w-9 rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {notices.slice(0, visibleCount).map((n) => (
          <NoticeItem key={n.id} {...n} />
        ))}

        {notices.length > NOTICE_PAGE_SIZE && (
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full gap-2 rounded-2xl border-0 bg-purple-50 font-semibold text-indigo-900 hover:bg-purple-100"
            disabled={visibleCount >= notices.length}
            onClick={() => setVisibleCount((count) => count + NOTICE_PAGE_SIZE)}
          >
            더보기 <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      <NoticeFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        mode="add"
        onSubmit={(c, a) => addNotice("", c, a, "none")}
      />
    </div>
  )
}

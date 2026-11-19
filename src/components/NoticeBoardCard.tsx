import { useState } from "react"
import { Pencil, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NoticeFormDialog } from "@/components/NoticeFormDialog"
import { NoticeComments } from "@/components/NoticeComments"
import { resolveNoticeColor } from "@/lib/noticeColors"
import { toRelativeTimeKo } from "@/lib/relativeTime"
import { splitHttpLinks } from "@/lib/url"
import { cn } from "@/lib/utils"
import { useLinkStore } from "@/store/useLinkStore"

const NOTICE_PAGE_SIZE = 3

interface NoticeItemProps {
  id: number
  tag: string
  content: string
  author: string
  color: string
  createdAt: string
}

function NoticeItem({ id, tag, content, author, color, createdAt }: NoticeItemProps) {
  const updateNotice = useLinkStore((s) => s.updateNotice)
  const deleteNotice = useLinkStore((s) => s.deleteNotice)
  const [editOpen, setEditOpen] = useState(false)
  const style = resolveNoticeColor(color)

  const handleDelete = () => {
    if (window.confirm("이 메모를 삭제할까요?")) {
      void deleteNotice(id)
    }
  }

  return (
    <div
      className={cn("group relative rounded-2xl p-4", style.bordered && "border border-slate-200")}
      style={style.bordered ? undefined : { backgroundColor: style.bg }}
    >
      <span
        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
        style={{ backgroundColor: style.tagBg, color: style.tagColor }}
      >
        {tag}
      </span>
      <p
        className="mt-2 min-w-0 overflow-hidden whitespace-pre-line break-words rounded-xl bg-white px-3 py-2 text-sm leading-relaxed text-slate-800"
      >
        {splitHttpLinks(content).map((part, index) =>
          part.type === "link" ? (
            <a
              key={index}
              href={part.value}
              title={part.value}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all underline decoration-current/40 underline-offset-2 hover:decoration-current"
            >
             🔗 링크 이동하기 
            </a>
          ) : (
            <span key={index}>{part.value}</span>
          ),
        )}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="min-w-0 truncate text-xs" style={{ color: style.mutedColor }}>
          {author} · {toRelativeTimeKo(createdAt)}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 rounded-full bg-white/70 text-slate-500 opacity-0 transition-opacity hover:bg-white hover:text-slate-700 group-hover:opacity-100 data-[state=open]:opacity-100"
            >
              <Pencil className="h-3 w-3" />
              <span className="sr-only">메모 메뉴</span>
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

      <NoticeComments noticeId={id} />
      <NoticeFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        initialTag={tag}
        initialContent={content}
        initialAuthor={author}
        initialColor={color}
        onSubmit={(t, c, a, col) => updateNotice(id, { tag: t, content: c, author: a, color: col })}
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
          <h3 className="text-sm font-black text-slate-900">🧸 팀 공지 메모</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="새 메모 작성"
          className="h-7 w-7 rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {notices.slice(0, visibleCount).map((n) => (
          <NoticeItem key={n.id} {...n} />
        ))}

        {notices.length > NOTICE_PAGE_SIZE && (
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-2xl"
            disabled={visibleCount >= notices.length}
            onClick={() => setVisibleCount((count) => count + NOTICE_PAGE_SIZE)}
          >
            더보기
          </Button>
        )}
      </div>

      <NoticeFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        mode="add"
        onSubmit={(t, c, a, col) => addNotice(t, c, a, col)}
      />
    </div>
  )
}

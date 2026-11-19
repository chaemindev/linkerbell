import { useEffect, useId, useState, type FormEvent } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toRelativeTimeKo } from "@/lib/relativeTime"
import { supabase } from "@/lib/supabase"

const MAX_COMMENT_LENGTH = 500
const COMMENT_COLUMNS = "id, content, created_at"

interface NoticeComment {
  id: string
  content: string
  created_at: string
}

export function NoticeComments({ noticeId }: { noticeId: number }) {
  const inputId = useId()
  const [comments, setComments] = useState<NoticeComment[] | null>(null)
  const [draft, setDraft] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadComments() {
      const { data, error } = await supabase
        .from("notice_comments")
        .select(COMMENT_COLUMNS)
        .eq("notice_id", noticeId)
        .order("created_at")
        .order("id")
        .abortSignal(controller.signal)

      if (controller.signal.aborted) return
      if (error) {
        setError("댓글을 불러오지 못했습니다. 페이지를 새로고침해 주세요.")
        return
      }
      setComments(data)
    }

    void loadComments()
    return () => controller.abort()
  }, [noticeId])

  async function addComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = draft.trim()
    if (!comments || !content || busy) return

    setBusy(true)
    setError("")
    const { data, error } = await supabase
      .from("notice_comments")
      .insert({ notice_id: noticeId, content })
      .select(COMMENT_COLUMNS)
      .single()

    if (error) {
      setError("댓글을 등록하지 못했습니다. 다시 시도해 주세요.")
    } else {
      setComments([...comments, data])
      setDraft("")
    }
    setBusy(false)
  }

  async function deleteComment(commentId: string) {
    if (!comments || busy || !window.confirm("이 댓글을 삭제할까요?")) return

    setBusy(true)
    setError("")
    const { error } = await supabase
      .from("notice_comments")
      .delete()
      .eq("notice_id", noticeId)
      .eq("id", commentId)

    if (error) {
      setError("댓글을 삭제하지 못했습니다. 다시 시도해 주세요.")
    } else {
      setComments(comments.filter((comment) => comment.id !== commentId))
    }
    setBusy(false)
  }

  return (
    <div className="mt-3 space-y-2 border-t border-slate-400/25 pt-3">
      <h4 className="text-xs font-semibold text-slate-400">comment</h4>
      {comments && comments.length > 0 && (
        <ul aria-label="댓글 목록" className="space-y-2">
          {comments.map((comment) => (
            <li key={comment.id} className="flex items-start gap-2 rounded-xl bg-white/80 px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-wrap break-words text-sm text-slate-800">{comment.content}</p>
                <time dateTime={comment.created_at} className="text-xs text-slate-500">
                  {toRelativeTimeKo(comment.created_at)}
                </time>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="댓글 삭제"
                className="text-slate-500 hover:text-red-600"
                disabled={busy}
                onClick={() => void deleteComment(comment.id)}
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      {!comments && !error && (
        <p role="status" className="text-xs text-slate-600">댓글을 불러오는 중입니다.</p>
      )}
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
      <form onSubmit={addComment} className="flex items-center gap-2">
        <label htmlFor={inputId} className="sr-only">댓글 내용</label>
        <input
          id={inputId}
          type="text"
          className="h-8 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
          placeholder="댓글을 입력하세요"
          maxLength={MAX_COMMENT_LENGTH}
          required
          value={draft}
          readOnly={busy}
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button
          type="submit"
          variant="outline"
          className="rounded-xl border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
          disabled={!comments || busy || !draft.trim()}
        >
          +
        </Button>
      </form>
    </div>
  )
}

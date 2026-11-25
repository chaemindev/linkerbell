import { ChevronLeft, ChevronRight } from "lucide-react"
import { getSeoulDateKey } from "@/lib/birthday"
import { cn } from "@/lib/utils"
import type { Todo } from "@/store/useMyBellTodoStore"

const weekdays = ["월", "화", "수", "목", "금"]
const weekdayDotColors = [
  "bg-rose-300",
  "bg-amber-300",
  "bg-emerald-300",
  "bg-sky-300",
  "bg-fuchsia-300",
]

function offsetDate(dateKey: string, days: number) {
  const date = new Date(dateKey)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

interface Props {
  selectedDate: string
  todos: Todo[]
  onSelect: (date: string) => void
}

export function MyBellTodoWeek({ selectedDate, todos, onSelect }: Props) {
  const weekdayIndex = (new Date(selectedDate).getUTCDay() + 6) % 7
  const monday = offsetDate(selectedDate, -weekdayIndex)
  // 목요일이 속한 달을 기준으로 주차를 표시한다.
  const thursday = new Date(offsetDate(monday, 3))
  return (
    <div className="mb-4 border-b border-slate-100 pb-4">
      <div className="mb-3 flex flex-wrap items-center gap-1 text-xs">
        {/* <span className="text-slate-400">{thursday.getUTCFullYear()}</span> */}
        <span className="font-bold text-slate-800">{thursday.getUTCMonth() + 1}월 {Math.ceil(thursday.getUTCDate() / 7)}주차</span>
        <div className="ml-auto flex items-center gap-1">
          <button type="button" aria-label="이전 주" className="rounded p-1 text-slate-500 hover:bg-slate-100" onClick={() => onSelect(offsetDate(monday, Math.min(weekdayIndex, 4) - 7))}>
            <ChevronLeft className="size-4" />
          </button>
          <button type="button" className="rounded px-2 py-1 font-medium text-teal-700 hover:bg-teal-50" onClick={() => onSelect(getSeoulDateKey())}>오늘</button>
          <button type="button" aria-label="다음 주" className="rounded p-1 text-slate-500 hover:bg-slate-100" onClick={() => onSelect(offsetDate(monday, Math.min(weekdayIndex, 4) + 7))}>
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
      <div role="group" aria-label="날짜 선택" className="grid grid-cols-5 gap-1.5">
        {weekdays.map((weekday, index) => {
          const date = offsetDate(monday, index)
          const selected = date === selectedDate
          const items = todos.filter((todo) => todo.date === date)
          const completed = items.filter((todo) => todo.completed).length
          return (
            <button
              type="button"
              key={date}
              aria-pressed={selected}
              aria-label={`${date} ${weekday}요일, 할 일 ${items.length}개 중 ${completed}개 완료`}
              onClick={() => onSelect(date)}
              className={cn(
                "flex min-w-0 flex-col items-center gap-1 rounded-lg py-2 focus-visible:-outline-offset-2",
                selected ? "bg-teal-600 text-white" : "text-slate-700 hover:bg-slate-50",
              )}
            >
              <span className={cn("text-xs", !selected && "text-slate-500")}>{weekday}</span>
              <span className="text-sm font-bold">{Number(date.slice(-2))}</span>
              <span aria-hidden="true" className={cn("size-1.5 rounded-full", weekdayDotColors[index])} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

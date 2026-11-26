import { useState, type ReactNode } from "react"
import { Check, Pencil, Plus, Star, Trash2, X } from "lucide-react"
import { useMyBellTodoStore } from "@/store/useMyBellTodoStore"
import { MyBellTodoWeek } from "./MyBellTodoWeek"
import { getSeoulDateKey } from "@/lib/birthday"
import { DndContext, closestCenter, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { sortableTransition } from "@/lib/dndSortable"
import type { Todo } from "@/store/useMyBellTodoStore"
import { cn } from "@/lib/utils"

function SortableTodoRow({ todo, disabled, children }: { todo: Todo; disabled: boolean; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: todo.id,
    disabled,
    transition: sortableTransition,
  })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative flex min-h-12 items-center gap-1 px-0.5 text-sm",
        todo.completed ? "text-slate-500" : "text-slate-700",
        !disabled && "cursor-grab touch-manipulation active:cursor-grabbing",
        isDragging && "z-10 rounded-md bg-white shadow-md",
      )}
      {...(!disabled ? attributes : {})}
      aria-label={disabled ? undefined : `${todo.title} 순서 이동`}
      onMouseDown={(event) => {
        if ((event.target as HTMLElement).closest("button, input, form")) return
        listeners?.onMouseDown?.(event)
      }}
      onTouchStart={(event) => {
        if ((event.target as HTMLElement).closest("button, input, form")) return
        listeners?.onTouchStart?.(event)
      }}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget) listeners?.onKeyDown?.(event)
      }}
    >
      {children}
    </li>
  )
}

export function MyBellTodoList() {
  const { todos: allTodos, addTodo, toggleTodo, renameTodo, deleteTodo, moveTodo } = useMyBellTodoStore()
  const [draft, setDraft] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [selectedDate, setSelectedDate] = useState(() => getSeoulDateKey())
  const todos = allTodos.filter((todo) => todo.date === selectedDate)
  const completed = todos.filter((todo) => todo.completed).length
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const percent = todos.length ? (completed / todos.length) * 100 : 0

  return (
    <section aria-labelledby="mybell-todos" className="min-w-0 space-y-3">
      <header className="flex flex-wrap items-center gap-2 px-1">
        <Star aria-hidden="true" className="size-5 shrink-0 fill-yellow-300 text-yellow-500" />
        <h2 id="mybell-todos" className="text-base font-bold text-slate-800">오늘의 할 일</h2>
        {/* <span aria-live="polite" className="text-xs font-medium tabular-nums text-slate-500">
          {completed} / {todos.length} 완료
        </span> */}
        <div
          role="progressbar"
          aria-label="할 일 완료율"
          aria-valuenow={Math.round(percent)}
          className="ml-auto h-1.5 w-1/5 overflow-hidden rounded-full bg-slate-200"
        >
          <div className="h-full rounded-full bg-yellow-400 transition-[width]" style={{ width: `${percent}%` }} />
        </div>
      </header>
      <div className="rounded-xl bg-white/90 p-4">
        <MyBellTodoWeek
          selectedDate={selectedDate}
          todos={allTodos}
          onSelect={(date) => {
            if (date !== selectedDate) {
              setSelectedDate(date)
              setEditingId(null)
              setDraft("")
            }
          }}
        />
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            if (!draft.trim()) return
            addTodo(draft, selectedDate)
            setDraft("")
          }}
        >
          <input
            aria-label="새 할 일"
            placeholder="+ 새 태스크 입력"
            className="h-9 min-w-0 flex-1 rounded-md border border-transparent bg-slate-50 px-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-teal-400"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button type="submit" aria-label="할 일 추가" disabled={!draft.trim()} className="flex size-9 shrink-0 items-center justify-center rounded-md text-teal-700 enabled:hover:bg-teal-50 disabled:text-slate-400">
            <Plus aria-hidden="true" className="size-5" />
          </button>
        </form>
        {todos.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={({ active, over }) => {
              if (over && active.id !== over.id) moveTodo(String(active.id), String(over.id))
            }}
          >
            <SortableContext items={todos.map((todo) => todo.id)} strategy={verticalListSortingStrategy}>
              <ul className="mt-3 divide-y divide-slate-100">
                {todos.map((todo) => (
                  <SortableTodoRow key={todo.id} todo={todo} disabled={todos.length < 2 || editingId !== null}>
                    {editingId === todo.id ? (
                      <form
                        className="flex w-full items-center gap-1"
                        onSubmit={(event) => {
                          event.preventDefault()
                          if (!editTitle.trim()) return
                          renameTodo(todo.id, editTitle)
                          setEditingId(null)
                        }}
                      >
                        <input
                          autoFocus
                          aria-label="할 일 내용 수정"
                          value={editTitle}
                          onChange={(event) => setEditTitle(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Escape" && !event.nativeEvent.isComposing) setEditingId(null)
                          }}
                          className="min-w-0 flex-1 rounded border border-teal-200 bg-white px-2 py-1 text-slate-700 focus:outline-teal-400"
                        />
                        <button type="submit" disabled={!editTitle.trim()} aria-label="수정 저장" className="rounded p-1 text-teal-600 hover:bg-teal-50 disabled:opacity-40">
                          <Check className="size-4" />
                        </button>
                        <button type="button" onClick={() => setEditingId(null)} aria-label="수정 취소" className="rounded p-1 text-slate-500 hover:bg-slate-100">
                          <X className="size-4" />
                        </button>
                      </form>
                    ) : (
                      <>
                        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 py-3">
                          <span className="relative flex size-4 shrink-0 items-center justify-center">
                            <input
                              type="checkbox"
                              className="peer size-full cursor-pointer appearance-none rounded border border-slate-300 bg-white checked:border-teal-600 checked:bg-teal-600 focus-visible:outline-teal-400"
                              checked={todo.completed}
                              onChange={() => toggleTodo(todo.id)}
                            />
                            <Check aria-hidden="true" strokeWidth={3} className="pointer-events-none absolute size-3 text-white opacity-0 peer-checked:opacity-100" />
                          </span>
                          <span className={cn("min-w-0 break-words", todo.completed && "line-through")}>{todo.title}</span>
                        </label>
                        <div className="flex shrink-0 items-center gap-0.5 transition-opacity [@media(hover:hover)]:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
                          <button
                            type="button"
                            aria-label={`${todo.title} 수정`}
                            onClick={() => {
                              setEditTitle(todo.title)
                              setEditingId(todo.id)
                            }}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-teal-50 hover:text-teal-600"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label={`${todo.title} 삭제`}
                            onClick={() => {
                              if (window.confirm(`"${todo.title}" 할 일을 삭제할까요?`)) deleteTodo(todo.id)
                            }}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </SortableTodoRow>
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </section>
  )
}

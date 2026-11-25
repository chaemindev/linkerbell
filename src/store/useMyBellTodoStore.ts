import { getSeoulDateKey } from "@/lib/birthday"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Todo {
  date: string
  id: string
  title: string
  completed: boolean
}

interface TodoStore {
  todos: Todo[]
  addTodo: (title: string, date: string) => void
  toggleTodo: (id: string) => void
  renameTodo: (id: string, value: string) => void
  deleteTodo: (id: string) => void
}

const storageKey = "mybell-todos"

export const useMyBellTodoStore = create<TodoStore>()(
  persist(
    (set) => ({
      todos: [],
      addTodo: (value, date) => {
        const title = value.trim()
        if (!title) return
        const todo = { id: crypto.randomUUID(), title, date, completed: false }
        set((state) => ({ todos: [...state.todos, todo] }))
      },
      renameTodo: (id, value) => {
        const title = value.trim()
        if (!title) return
        set((state) => ({
          todos: state.todos.map((todo) => todo.id === id ? { ...todo, title } : todo),
        }))
      },
      deleteTodo: (id) => set((state) => ({
        todos: state.todos.filter((todo) => todo.id !== id),
      })),
      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo,
          ),
        })),
    }),
    {
      name: storageKey,
      version: 1,
      partialize: ({ todos }) => ({ todos }),
      migrate: (persisted) => {
        const { todos } = persisted as { todos: (Omit<Todo, "date"> & { date?: string })[] }
        const today = getSeoulDateKey()
        return { todos: todos.map((todo) => ({ ...todo, date: todo.date ?? today })) }
      },
    },
  ),
)

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === storageKey && event.newValue) {
      void useMyBellTodoStore.persist.rehydrate()
    }
  })
}

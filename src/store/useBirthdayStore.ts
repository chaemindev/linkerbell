import { create } from "zustand"

interface BirthdayState {
  isBirthdayToday: boolean
  setBirthdayToday: (value: boolean) => void
}

export const useBirthdayStore = create<BirthdayState>((set) => ({
  isBirthdayToday: false,
  setBirthdayToday: (value) => set({ isBirthdayToday: value }),
}))

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type HistoryItem = { ts: number; ml: number }

export type HydrationState = {
  goal: number
  intake: number
  interval: number // minutes
  sound: boolean
  dark: boolean
  dev: boolean
  lastReminder: number | null
  history: HistoryItem[]
}

export type HydrationActions = {
  addIntake: (ml: number) => void
  reset: () => void
  setSetting: <K extends keyof HydrationState>(key: K, value: HydrationState[K]) => void
  recordReminder: () => void
}

const defaultState = (): HydrationState => ({
  goal: 2500,
  intake: 0,
  interval: 60,
  sound: true,
  dark: typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
  dev: false,
  lastReminder: null,
  history: []
})

export const useHydrationStore = create<HydrationState & HydrationActions>()(
  persist(
    (set, get) => ({
      ...defaultState(),
      addIntake: (ml) => set(s => ({
        intake: Math.min(s.goal, s.intake + ml),
        history: [...s.history, { ts: Date.now(), ml }]
      })),
      reset: () => set(s => ({ intake: 0 })),
      setSetting: (key, value) => set(() => ({ [key]: value } as any)),
      recordReminder: () => set(() => ({ lastReminder: Date.now() }))
    }),
    { name: 'hydrate.state' }
  )
)

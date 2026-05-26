import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface FastingSession {
  id: string
  startTime: string   // ISO string
  endTime: string | null
  targetHours: number
  completed: boolean
}

const STORAGE_KEY = 'mamba_fasting'

function load(): FastingSession[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function save(data: FastingSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const useFastingStore = defineStore('fasting', () => {
  const sessions = ref<FastingSession[]>(load())
  const activeFast = ref<FastingSession | null>(
    sessions.value.find(s => !s.completed) ?? null
  )

  const history = computed(() =>
    sessions.value
      .filter(s => s.completed)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  )

  function startFast(targetHours: number) {
    if (activeFast.value) return
    const session: FastingSession = {
      id: crypto.randomUUID(),
      startTime: new Date().toISOString(),
      endTime: null,
      targetHours,
      completed: false
    }
    activeFast.value = session
    sessions.value.push(session)
    save(sessions.value)
  }

  function endFast() {
    if (!activeFast.value) return
    const idx = sessions.value.findIndex(s => s.id === activeFast.value!.id)
    if (idx !== -1) {
      sessions.value[idx].endTime = new Date().toISOString()
      sessions.value[idx].completed = true
    }
    activeFast.value = null
    save(sessions.value)
  }

  function deleteSession(id: string) {
    sessions.value = sessions.value.filter(s => s.id !== id)
    save(sessions.value)
  }

  // Returns last 7 days fasting stats
  const weeklyStats = computed(() => {
    const result: { date: string; totalHours: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]

      const dayFasts = sessions.value.filter(s => {
        return s.completed && s.startTime.startsWith(dateStr) && s.endTime
      })

      const totalMs = dayFasts.reduce((acc, s) => {
        return acc + (new Date(s.endTime!).getTime() - new Date(s.startTime).getTime())
      }, 0)

      result.push({ date: dateStr, totalHours: +(totalMs / 3600000).toFixed(1) })
    }
    return result
  })

  return { sessions, activeFast, history, weeklyStats, startFast, endFast, deleteSession }
})

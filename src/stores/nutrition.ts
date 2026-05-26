import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Meal {
  id: string
  name: string
  calories: number
  date: string   // YYYY-MM-DD
  time: string   // HH:MM
}

export interface DailyGoal {
  calories: number
}

const MEALS_KEY = 'mamba_meals'
const GOAL_KEY  = 'mamba_goal'

function loadMeals(): Meal[] {
  try { return JSON.parse(localStorage.getItem(MEALS_KEY) || '[]') }
  catch { return [] }
}

function loadGoal(): number {
  try { return Number(localStorage.getItem(GOAL_KEY) || '2000') }
  catch { return 2000 }
}

function saveMeals(meals: Meal[]) {
  localStorage.setItem(MEALS_KEY, JSON.stringify(meals))
}

export const useNutritionStore = defineStore('nutrition', () => {
  const meals   = ref<Meal[]>(loadMeals())
  const dailyGoal = ref<number>(loadGoal())

  const today = () => new Date().toISOString().split('T')[0]

  const todayMeals = computed(() =>
    meals.value
      .filter(m => m.date === today())
      .sort((a, b) => b.time.localeCompare(a.time))
  )

  const todayCalories = computed(() =>
    todayMeals.value.reduce((acc, m) => acc + m.calories, 0)
  )

  const todayProgress = computed(() =>
    Math.min((todayCalories.value / dailyGoal.value) * 100, 100)
  )

  function addMeal(name: string, calories: number) {
    const now = new Date()
    meals.value.push({
      id: crypto.randomUUID(),
      name,
      calories,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5)
    })
    saveMeals(meals.value)
  }

  function deleteMeal(id: string) {
    meals.value = meals.value.filter(m => m.id !== id)
    saveMeals(meals.value)
  }

  function setGoal(kcal: number) {
    dailyGoal.value = kcal
    localStorage.setItem(GOAL_KEY, String(kcal))
  }

  // Weekly calorie average per day
  const weeklyStats = computed(() => {
    const result: { date: string; calories: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const dayMeals = meals.value.filter(m => m.date === dateStr)
      const total = dayMeals.reduce((acc, m) => acc + m.calories, 0)
      result.push({ date: dateStr, calories: total })
    }
    return result
  })

  const weeklyAvgCalories = computed(() => {
    const days = weeklyStats.value.filter(d => d.calories > 0)
    if (!days.length) return 0
    return Math.round(days.reduce((a, d) => a + d.calories, 0) / days.length)
  })

  return {
    meals, dailyGoal, todayMeals, todayCalories, todayProgress,
    weeklyStats, weeklyAvgCalories,
    addMeal, deleteMeal, setGoal
  }
})

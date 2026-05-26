<template>
  <div class="page animate-fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Nutrição</h1>
        <p class="page-sub">Acompanhe sua ingestão calórica diária</p>
      </div>
      <button class="btn btn-ghost" @click="showGoalModal = true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
        </svg>
        Meta: {{ nutritionStore.dailyGoal }} kcal
      </button>
    </div>

    <!-- Progress section -->
    <div class="card progress-card">
      <div class="progress-header">
        <div>
          <span class="label">Consumido hoje</span>
          <div class="progress-numbers">
            <span class="value-big" :class="overGoal ? 'over' : 'value-big--teal'">
              {{ nutritionStore.todayCalories }}
            </span>
            <span class="progress-sep">/ {{ nutritionStore.dailyGoal }}</span>
            <span class="kcal-label">kcal</span>
          </div>
        </div>
        <div class="progress-pct" :class="overGoal ? 'over' : ''">
          {{ Math.round(nutritionStore.todayProgress) }}%
        </div>
      </div>

      <div class="progress-track" style="height:12px; margin-top:1rem">
        <div
          class="progress-fill"
          :style="{
            width: nutritionStore.todayProgress + '%',
            background: overGoal
              ? 'linear-gradient(90deg,var(--warning),var(--danger))'
              : 'linear-gradient(90deg,var(--teal),var(--green))'
          }"
        ></div>
      </div>

      <div class="progress-stats">
        <div class="pstat">
          <span class="label">Restante</span>
          <span :class="overGoal ? 'text-danger' : ''">
            {{ overGoal ? '+' : '' }}{{ Math.abs(nutritionStore.dailyGoal - nutritionStore.todayCalories) }} kcal
          </span>
        </div>
        <div class="pstat">
          <span class="label">Refeições hoje</span>
          <span>{{ nutritionStore.todayMeals.length }}</span>
        </div>
        <div class="pstat">
          <span class="label">Média/refeição</span>
          <span>{{ avgPerMeal }} kcal</span>
        </div>
      </div>
    </div>

    <!-- Form + List grid -->
    <div class="nutrition-grid">
      <!-- Add meal form -->
      <div class="card form-card">
        <h2 class="card-title">Registrar Refeição</h2>

        <form class="meal-form" @submit.prevent="addMeal">
          <div class="form-group">
            <label class="label">Nome da refeição</label>
            <input
              v-model="mealName"
              type="text"
              placeholder="Ex: Frango com arroz"
              required
            />
          </div>

          <div class="form-group">
            <label class="label">Calorias (kcal)</label>
            <input
              v-model.number="mealCalories"
              type="number"
              placeholder="Ex: 450"
              min="1"
              required
            />
          </div>

          <!-- Quick picks -->
          <div class="form-group">
            <label class="label">Sugestões rápidas</label>
            <div class="quick-picks">
              <button
                v-for="pick in quickPicks"
                :key="pick.name"
                type="button"
                class="quick-btn"
                @click="applyPick(pick)"
              >
                {{ pick.name }}<em>{{ pick.cal }}kcal</em>
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-full" :disabled="!mealName || !mealCalories">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Adicionar Refeição
          </button>
        </form>
      </div>

      <!-- Today's meals list -->
      <div class="card meals-card">
        <h2 class="card-title">Refeições de Hoje</h2>

        <div v-if="nutritionStore.todayMeals.length === 0" class="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".35">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
          </svg>
          <p>Nenhuma refeição registrada</p>
        </div>

        <div v-else class="meals-list">
          <TransitionGroup name="slide-up">
            <div
              v-for="meal in nutritionStore.todayMeals"
              :key="meal.id"
              class="meal-item"
            >
              <div class="meal-left">
                <div class="meal-icon">
                  {{ mealEmoji(meal.name) }}
                </div>
                <div>
                  <div class="meal-name">{{ meal.name }}</div>
                  <div class="meal-time">{{ meal.time }}</div>
                </div>
              </div>
              <div class="meal-right">
                <span class="meal-kcal">{{ meal.calories }}</span>
                <span class="kcal-unit">kcal</span>
                <button class="del-btn" @click="nutritionStore.deleteMeal(meal.id)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>

    <!-- Goal Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showGoalModal" class="modal-overlay" @click.self="showGoalModal = false">
          <div class="modal-box card">
            <h3 class="modal-title">Ajustar Meta Calórica</h3>
            <div class="form-group" style="margin-top:1rem">
              <label class="label">Meta diária de calorias</label>
              <input v-model.number="goalInput" type="number" min="500" max="9999" />
            </div>
            <div class="modal-actions">
              <button class="btn btn-ghost" @click="showGoalModal = false">Cancelar</button>
              <button class="btn btn-primary" @click="saveGoal">Salvar</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useNutritionStore } from '@/stores/nutrition'

const nutritionStore = useNutritionStore()

const mealName     = ref('')
const mealCalories = ref<number | null>(null)
const showGoalModal = ref(false)
const goalInput    = ref(nutritionStore.dailyGoal)

const overGoal = computed(() => nutritionStore.todayCalories > nutritionStore.dailyGoal)

const avgPerMeal = computed(() => {
  const m = nutritionStore.todayMeals
  if (!m.length) return 0
  return Math.round(m.reduce((a, x) => a + x.calories, 0) / m.length)
})

function addMeal() {
  if (!mealName.value || !mealCalories.value) return
  nutritionStore.addMeal(mealName.value, mealCalories.value)
  mealName.value = ''
  mealCalories.value = null
}

function saveGoal() {
  if (goalInput.value >= 500) {
    nutritionStore.setGoal(goalInput.value)
    showGoalModal.value = false
  }
}

const quickPicks = [
  { name: '🍚 Arroz', cal: 130 },
  { name: '🍗 Frango', cal: 200 },
  { name: '🥗 Salada', cal: 80 },
  { name: '🍌 Banana', cal: 90 },
  { name: '🥚 Ovo', cal: 70 },
  { name: '☕ Café', cal: 15 }
]

function applyPick(pick: { name: string; cal: number }) {
  mealName.value = pick.name.replace(/^.{2}/, '').trim()
  mealCalories.value = pick.cal
}

const emojiMap: Record<string, string> = {
  frango: '🍗', arroz: '🍚', salada: '🥗', banana: '🍌',
  ovo: '🥚', café: '☕', pizza: '🍕', pão: '🍞',
  maçã: '🍎', iogurte: '🥛', feijão: '🫘', massa: '🍝'
}

function mealEmoji(name: string) {
  const lower = name.toLowerCase()
  for (const [key, val] of Object.entries(emojiMap)) {
    if (lower.includes(key)) return val
  }
  return '🍽️'
}
</script>

<style scoped>
.page-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;
}
.page-title { font-size: 1.8rem; font-weight: 700; }
.page-sub   { color: var(--text-secondary); margin-top: 0.25rem; font-size: 0.9rem; }

/* Progress card */
.progress-card { margin-bottom: 1.5rem; }
.progress-header { display: flex; justify-content: space-between; align-items: flex-start; }
.progress-numbers { display: flex; align-items: baseline; gap: 0.4rem; margin-top: 0.4rem; }
.progress-sep { color: var(--text-muted); font-size: 1.2rem; }
.kcal-label   { font-size: 0.85rem; color: var(--text-muted); }
.progress-pct {
  font-family: var(--font-mono);
  font-size: 2rem;
  font-weight: 700;
  color: var(--teal);
}
.progress-pct.over { color: var(--danger); }
.over { color: var(--danger) !important; }

.progress-stats {
  display: flex; gap: 2rem; margin-top: 1.2rem; flex-wrap: wrap;
}
.pstat { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.9rem; color: var(--text-secondary); }
.text-danger { color: var(--danger); }

/* Grid */
.nutrition-grid {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 1.5rem;
  align-items: start;
}

.card-title { font-size: 1rem; font-weight: 700; margin-bottom: 1rem; }

/* Form */
.meal-form { display: flex; flex-direction: column; gap: 1rem; }

.quick-picks {
  display: flex; flex-wrap: wrap; gap: 0.4rem;
}

.quick-btn {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.35rem 0.65rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: var(--font-body);
}
.quick-btn em {
  font-style: normal;
  color: var(--text-muted);
  font-size: 0.72rem;
}
.quick-btn:hover {
  border-color: var(--teal);
  color: var(--teal);
  background: rgba(0,186,180,0.08);
}

.w-full { width: 100%; }

/* Meals list */
.meals-card { display: flex; flex-direction: column; gap: 0; }
.empty-state {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 0.75rem; color: var(--text-muted);
  font-size: 0.85rem; padding: 3rem 0;
}
.meals-list { display: flex; flex-direction: column; gap: 0.5rem; }

.meal-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.75rem 0.9rem;
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  transition: border-color 0.2s ease;
}
.meal-item:hover { border-color: var(--steel-blue); }

.meal-left  { display: flex; align-items: center; gap: 0.75rem; }
.meal-right { display: flex; align-items: center; gap: 0.5rem; }

.meal-icon {
  width: 36px; height: 36px;
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.meal-name { font-size: 0.88rem; font-weight: 600; color: var(--text-primary); }
.meal-time { font-size: 0.75rem; color: var(--text-muted); }

.meal-kcal {
  font-family: var(--font-mono);
  font-size: 1rem;
  font-weight: 700;
  color: var(--teal);
}
.kcal-unit { font-size: 0.72rem; color: var(--text-muted); }

.del-btn {
  background: none; border: none; cursor: pointer;
  color: var(--text-muted); padding: 0.25rem;
  border-radius: 4px; display: flex; align-items: center;
  transition: color 0.2s ease; margin-left: 0.25rem;
}
.del-btn:hover { color: var(--danger); }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 500;
  backdrop-filter: blur(4px);
}
.modal-box { width: 340px; max-width: 90vw; }
.modal-title { font-size: 1.05rem; font-weight: 700; }
.modal-actions {
  display: flex; justify-content: flex-end; gap: 0.75rem;
  margin-top: 1.25rem;
}

@media (max-width: 900px) {
  .nutrition-grid { grid-template-columns: 1fr; }
}
</style>

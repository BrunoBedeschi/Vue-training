<template>
  <div class="page animate-fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-sub">Resumo dos últimos 7 dias</p>
      </div>
      <div class="header-date">{{ formattedToday }}</div>
    </div>

    <!-- KPI row -->
    <div class="kpi-row">
      <div class="card kpi-card">
        <span class="label">Total de Jejum (7d)</span>
        <span class="value-big value-big--teal">{{ totalFastHours }}h</span>
        <span class="kpi-sub">{{ fastingDays }} dias com jejum</span>
      </div>
      <div class="card kpi-card">
        <span class="label">Média Calórica Diária</span>
        <span class="value-big value-big--green">{{ nutritionStore.weeklyAvgCalories }}</span>
        <span class="kpi-sub">kcal / dia</span>
      </div>
      <div class="card kpi-card">
        <span class="label">Meta Calórica</span>
        <span class="value-big">{{ nutritionStore.dailyGoal }}</span>
        <span class="kpi-sub">kcal configurada</span>
      </div>
      <div class="card kpi-card">
        <span class="label">Jejum Hoje</span>
        <span class="value-big" :class="fastingStore.activeFast ? 'value-big--teal' : ''">
          {{ fastingStore.activeFast ? 'Ativo' : todayFastHours > 0 ? todayFastHours + 'h' : '—' }}
        </span>
        <span class="kpi-sub">{{ fastingStore.activeFast ? 'em andamento' : todayFastHours > 0 ? 'concluído' : 'não iniciado' }}</span>
      </div>
    </div>

    <!-- Charts -->
    <div class="charts-grid">
      <!-- Fasting chart -->
      <div class="card chart-card">
        <h2 class="card-title">Horas de Jejum — Ultimos 7 Dias</h2>
        <div class="chart-wrap">
          <Bar v-if="fastingChartData.labels?.length" :data="fastingChartData" :options="barOptions" />
          <div v-else class="no-data">Sem dados de jejum ainda</div>
        </div>
        <!-- Minibar fallback always visible -->
        <div class="mini-bars">
          <div
            v-for="(d, i) in fastingStore.weeklyStats"
            :key="i"
            class="mini-bar-col"
          >
            <div class="mini-bar-track">
              <div
                class="mini-bar-fill"
                :style="{ height: barHeight(d.totalHours) + '%', background: 'var(--teal)' }"
              ></div>
            </div>
            <span class="mini-bar-label">{{ shortDay(d.date) }}</span>
            <span class="mini-bar-val">{{ d.totalHours }}h</span>
          </div>
        </div>
      </div>

      <!-- Calorie chart -->
      <div class="card chart-card">
        <h2 class="card-title">Calorias Consumidas — Ultimos 7 Dias</h2>
        <div class="mini-bars">
          <div
            v-for="(d, i) in nutritionStore.weeklyStats"
            :key="i"
            class="mini-bar-col"
          >
            <div class="mini-bar-track">
              <div
                class="mini-bar-fill"
                :style="{
                  height: calBarHeight(d.calories) + '%',
                  background: d.calories > nutritionStore.dailyGoal
                    ? 'var(--danger)' : 'var(--green)'
                }"
              ></div>
            </div>
            <span class="mini-bar-label">{{ shortDay(d.date) }}</span>
            <span class="mini-bar-val">{{ d.calories > 0 ? d.calories : '—' }}</span>
          </div>
        </div>
        <!-- Goal line indicator -->
        <div class="goal-line-info">
          <span class="tag tag--teal">Meta: {{ nutritionStore.dailyGoal }} kcal/dia</span>
          <span class="tag tag--green" v-if="nutritionStore.weeklyAvgCalories > 0">
            Média: {{ nutritionStore.weeklyAvgCalories }} kcal
          </span>
        </div>
      </div>
    </div>

    <!-- Recent fasting history -->
    <div class="card" style="margin-top:1.5rem" v-if="fastingStore.history.length > 0">
      <h2 class="card-title">Últimos Jejuns</h2>
      <div class="recent-list">
        <div v-for="s in fastingStore.history.slice(0,5)" :key="s.id" class="recent-item">
          <div class="recent-left">
            <span class="tag tag--navy">{{ formatDate(s.startTime) }}</span>
            <span class="recent-duration">{{ formatDuration(s) }}</span>
          </div>
          <div class="completion-wrap">
            <div class="mini-progress">
              <div class="mini-fill" :style="{ width: Math.min((getDurationH(s) / s.targetHours) * 100, 100) + '%' }"></div>
            </div>
            <span class="completion-txt">{{ Math.min(Math.round((getDurationH(s) / s.targetHours) * 100), 100) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty dashboard message -->
    <div v-if="!hasAnyData" class="empty-dashboard">
      <div class="empty-icon">🌿</div>
      <h3>Pronto para começar sua jornada?</h3>
      <p>Registre sua primeira refeição ou inicie um jejum para ver seus dados aqui.</p>
      <div class="empty-actions">
        <RouterLink to="/fasting" class="btn btn-primary">Iniciar Jejum</RouterLink>
        <RouterLink to="/nutrition" class="btn btn-ghost">Registrar Refeição</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend
} from 'chart.js'
import { useFastingStore, type FastingSession } from '@/stores/fasting'
import { useNutritionStore } from '@/stores/nutrition'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const fastingStore   = useFastingStore()
const nutritionStore = useNutritionStore()

const formattedToday = computed(() =>
  new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
)

const totalFastHours = computed(() =>
  fastingStore.weeklyStats.reduce((a, d) => a + d.totalHours, 0).toFixed(1)
)

const fastingDays = computed(() =>
  fastingStore.weeklyStats.filter(d => d.totalHours > 0).length
)

const todayFastHours = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return fastingStore.weeklyStats.find(d => d.date === today)?.totalHours ?? 0
})

const hasAnyData = computed(() =>
  fastingStore.sessions.length > 0 || nutritionStore.meals.length > 0
)

const maxFastH = computed(() => Math.max(...fastingStore.weeklyStats.map(d => d.totalHours), 1))
const maxCalories = computed(() => Math.max(...nutritionStore.weeklyStats.map(d => d.calories), nutritionStore.dailyGoal, 1))

function barHeight(h: number) { return Math.round((h / maxFastH.value) * 100) }
function calBarHeight(c: number) { return Math.round((c / maxCalories.value) * 100) }

function shortDay(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })
    .replace('.', '').slice(0, 3)
}

// Chart.js data
const fastingChartData = computed(() => ({
  labels: fastingStore.weeklyStats.map(d => shortDay(d.date)),
  datasets: [{
    label: 'Horas de Jejum',
    data: fastingStore.weeklyStats.map(d => d.totalHours),
    backgroundColor: 'rgba(0,186,180,0.25)',
    borderColor: '#00BAB4',
    borderWidth: 2,
    borderRadius: 6
  }]
}))

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8fa3b8' } },
    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8fa3b8' } }
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function formatDuration(s: FastingSession) {
  if (!s.endTime) return '--'
  const ms = new Date(s.endTime).getTime() - new Date(s.startTime).getTime()
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return `${h}h ${m}m`
}

function getDurationH(s: FastingSession) {
  if (!s.endTime) return 0
  return (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 3600000
}
</script>

<style scoped>
.page-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 2rem; flex-wrap: wrap; gap: 0.5rem;
}
.page-title { font-size: 1.8rem; font-weight: 700; }
.page-sub   { color: var(--text-secondary); margin-top: 0.25rem; font-size: 0.9rem; }
.header-date {
  font-size: 0.82rem;
  color: var(--text-muted);
  text-transform: capitalize;
  margin-top: 0.5rem;
}

/* KPI row */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.kpi-card {
  display: flex; flex-direction: column; gap: 0.35rem;
}

.kpi-sub {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 0.1rem;
}

/* Charts */
.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.chart-card { display: flex; flex-direction: column; gap: 1rem; }
.card-title  { font-size: 1rem; font-weight: 700; margin-bottom: 0.5rem; }

.chart-wrap { height: 160px; }
.no-data {
  height: 100%;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-muted); font-size: 0.85rem;
}

/* Mini bar chart */
.mini-bars {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  height: 120px;
  padding-top: 0.5rem;
}

.mini-bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  height: 100%;
}

.mini-bar-track {
  flex: 1; width: 100%;
  background: var(--bg-surface);
  border-radius: var(--radius-sm);
  display: flex; align-items: flex-end; overflow: hidden;
}

.mini-bar-fill {
  width: 100%;
  border-radius: var(--radius-sm);
  transition: height 0.8s cubic-bezier(0.34,1.56,0.64,1);
  min-height: 2px;
}

.mini-bar-label {
  font-size: 0.68rem;
  color: var(--text-muted);
  text-transform: capitalize;
}

.mini-bar-val {
  font-size: 0.65rem;
  color: var(--text-secondary);
  font-family: var(--font-mono);
}

.goal-line-info {
  display: flex; gap: 0.5rem; flex-wrap: wrap;
  margin-top: 0.25rem;
}

/* Recent fasting list */
.recent-list { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.75rem; }

.recent-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.65rem 0.9rem;
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.recent-left  { display: flex; align-items: center; gap: 0.75rem; }
.recent-duration { font-size: 0.88rem; color: var(--text-secondary); }

.completion-wrap { display: flex; align-items: center; gap: 0.6rem; }
.mini-progress {
  width: 80px; height: 5px;
  background: var(--bg-card);
  border-radius: 99px; overflow: hidden;
}
.mini-fill {
  height: 100%; background: var(--teal);
  border-radius: 99px; transition: width 0.6s ease;
}
.completion-txt { font-size: 0.75rem; color: var(--text-muted); min-width: 30px; }

/* Empty dashboard */
.empty-dashboard {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  gap: 1rem;
}
.empty-icon { font-size: 3rem; }
.empty-dashboard h3 { font-size: 1.2rem; font-weight: 700; }
.empty-dashboard p { color: var(--text-secondary); font-size: 0.9rem; max-width: 340px; }
.empty-actions { display: flex; gap: 0.75rem; margin-top: 0.5rem; flex-wrap: wrap; justify-content: center; }

@media (max-width: 1000px) {
  .kpi-row { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .charts-grid { grid-template-columns: 1fr; }
  .kpi-row { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .kpi-row { grid-template-columns: 1fr 1fr; }
}
</style>

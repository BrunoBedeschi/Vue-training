<template>
  <div class="page animate-fade-in">
    <div class="page-header">
      <div>
        <h1 class="page-title">Jejum Intermitente</h1>
        <p class="page-sub">Controle seus ciclos de jejum em tempo real</p>
      </div>
    </div>

    <div class="fasting-grid">
      <!-- Timer Card -->
      <div class="card card--glow timer-card" :class="{ 'is-active': fastingStore.activeFast }">
        <div class="timer-ring-wrap">
          <svg class="timer-ring" viewBox="0 0 160 160">
            <circle class="ring-bg" cx="80" cy="80" r="70" />
            <circle
              class="ring-progress"
              cx="80" cy="80" r="70"
              :stroke-dasharray="`${ringProgress} 440`"
              :stroke="ringColor"
            />
          </svg>
          <div class="timer-center">
            <span class="label" style="text-align:center">{{ fastingStore.activeFast ? 'Jejuando há' : 'Sem jejum ativo' }}</span>
            <span class="value-big" :class="fastingStore.activeFast ? 'value-big--teal' : ''">
              {{ elapsed }}
            </span>
            <span v-if="fastingStore.activeFast" class="timer-meta">
              de {{ fastingStore.activeFast.targetHours }}h meta
            </span>
          </div>
        </div>

        <!-- Pulse indicator -->
        <div v-if="fastingStore.activeFast" class="pulse-wrap">
          <div class="pulse-dot"></div>
          <div class="pulse-ring"></div>
          <span class="pulse-label">Ativo</span>
        </div>

        <!-- Controls -->
        <div v-if="!fastingStore.activeFast" class="start-controls">
          <div class="form-group">
            <label class="label">Janela de Jejum</label>
            <div class="window-options">
              <button
                v-for="opt in windowOptions"
                :key="opt.value"
                class="window-btn"
                :class="{ 'window-btn--active': selectedWindow === opt.value }"
                @click="selectWindow(opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <div v-if="selectedWindow === 0" class="form-group">
            <label class="label">Duração personalizada (horas)</label>
            <input
              v-model.number="customHours"
              type="number"
              min="1" max="72"
              placeholder="Ex: 14"
            />
          </div>

          <button class="btn btn-primary w-full" @click="startFast">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
            </svg>
            Iniciar Jejum
          </button>
        </div>

        <div v-else class="active-info">
          <div class="info-row">
            <span class="label">Início</span>
            <span>{{ formatTime(fastingStore.activeFast.startTime) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Previsão de término</span>
            <span>{{ endTime }}</span>
          </div>
          <button class="btn btn-danger w-full" @click="endFast">
            Encerrar Jejum
          </button>
        </div>
      </div>

      <!-- History Card -->
      <div class="card history-card">
        <h2 class="card-title">Histórico de Jejuns</h2>
        <div v-if="fastingStore.history.length === 0" class="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".35">
            <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
          </svg>
          <p>Nenhum jejum concluído ainda</p>
        </div>

        <div v-else class="history-list">
          <TransitionGroup name="slide-up">
            <div
              v-for="session in fastingStore.history.slice(0, 10)"
              :key="session.id"
              class="history-item"
            >
              <div class="history-left">
                <span :class="['tag', session.completed ? 'tag--green' : 'tag--navy']">
                  {{ formatDuration(session) }}
                </span>
                <div class="history-meta">
                  <span>{{ formatDate(session.startTime) }}</span>
                  <span class="dot">·</span>
                  <span>Meta: {{ session.targetHours }}h</span>
                </div>
              </div>
              <div class="history-right">
                <div class="completion-bar" :title="`${completionPct(session)}% da meta`">
                  <div
                    class="completion-fill"
                    :style="{ width: completionPct(session) + '%', background: completionColor(session) }"
                  ></div>
                </div>
                <button class="del-btn" @click="fastingStore.deleteSession(session.id)" title="Remover">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useFastingStore, type FastingSession } from '@/stores/fasting'

const fastingStore = useFastingStore()

const windowOptions = [
  { label: '16:8', value: 16 },
  { label: '18:6', value: 18 },
  { label: '20:4', value: 20 },
  { label: '24h',  value: 24 },
  { label: 'Definir', value: 0 }
]

const selectedWindow = ref(16)
const customHours    = ref(14)
const now            = ref(Date.now())

let timer: ReturnType<typeof setInterval>

onMounted(() => {
  timer = setInterval(() => { now.value = Date.now() }, 1000)
})
onUnmounted(() => clearInterval(timer))

function selectWindow(val: number) { selectedWindow.value = val }

function startFast() {
  const h = selectedWindow.value === 0 ? customHours.value : selectedWindow.value
  if (!h || h < 1) return
  fastingStore.startFast(h)
}

function endFast() {
  fastingStore.endFast()
}

// Elapsed hh:mm:ss
const elapsed = computed(() => {
  if (!fastingStore.activeFast) return '00:00:00'
  const ms = now.value - new Date(fastingStore.activeFast.startTime).getTime()
  const s  = Math.floor(ms / 1000)
  const h  = Math.floor(s / 3600)
  const m  = Math.floor((s % 3600) / 60)
  const sc = s % 60
  return `${pad(h)}:${pad(m)}:${pad(sc)}`
})

const ringProgress = computed(() => {
  if (!fastingStore.activeFast) return 0
  const ms = now.value - new Date(fastingStore.activeFast.startTime).getTime()
  const target = fastingStore.activeFast.targetHours * 3600000
  return Math.min((ms / target) * 440, 440)
})

const ringColor = computed(() => {
  if (!fastingStore.activeFast) return 'var(--border)'
  const pct = ringProgress.value / 440
  if (pct >= 1) return 'var(--green)'
  if (pct > 0.6) return 'var(--teal)'
  return 'var(--steel-blue)'
})

const endTime = computed(() => {
  if (!fastingStore.activeFast) return ''
  const end = new Date(fastingStore.activeFast.startTime).getTime() + fastingStore.activeFast.targetHours * 3600000
  return new Date(end).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
})

function pad(n: number) { return String(n).padStart(2, '0') }

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function formatDuration(s: FastingSession) {
  if (!s.endTime) return '--'
  const ms = new Date(s.endTime).getTime() - new Date(s.startTime).getTime()
  const h  = Math.floor(ms / 3600000)
  const m  = Math.floor((ms % 3600000) / 60000)
  return `${h}h ${m}m`
}

function completionPct(s: FastingSession) {
  if (!s.endTime) return 0
  const done = new Date(s.endTime).getTime() - new Date(s.startTime).getTime()
  return Math.min(Math.round((done / (s.targetHours * 3600000)) * 100), 100)
}

function completionColor(s: FastingSession) {
  const p = completionPct(s)
  if (p >= 100) return 'var(--green)'
  if (p >= 60)  return 'var(--teal)'
  return 'var(--steel-blue)'
}
</script>

<style scoped>
.page-header { margin-bottom: 2rem; }
.page-title  { font-size: 1.8rem; font-weight: 700; }
.page-sub    { color: var(--text-secondary); margin-top: 0.25rem; font-size: 0.9rem; }

.fasting-grid {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 1.5rem;
  align-items: start;
}

/* Timer card */
.timer-card { display: flex; flex-direction: column; gap: 1.5rem; }
.timer-card.is-active { border-color: rgba(0,186,180,0.4); }

.timer-ring-wrap {
  position: relative;
  width: 180px; height: 180px;
  margin: 0 auto;
}

.timer-ring { width: 100%; height: 100%; transform: rotate(-90deg); }

.ring-bg {
  fill: none;
  stroke: var(--bg-surface);
  stroke-width: 10;
}

.ring-progress {
  fill: none;
  stroke-width: 10;
  stroke-linecap: round;
  transition: stroke-dasharray 1s linear, stroke 0.5s ease;
}

.timer-center {
  position: absolute;
  inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 0.2rem;
}

.timer-meta { font-size: 0.78rem; color: var(--text-muted); margin-top: 0.2rem; }

/* Pulse */
.pulse-wrap {
  display: flex; align-items: center; gap: 0.6rem;
  justify-content: center;
}
.pulse-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--green);
  position: relative;
  box-shadow: 0 0 8px var(--green);
}
.pulse-ring {
  position: absolute;
  width: 8px; height: 8px;
  border-radius: 50%;
  border: 2px solid var(--green);
  animation: pulse-ring 1.5s ease infinite;
}
.pulse-label { font-size: 0.8rem; color: var(--green); font-weight: 600; }

/* Window options */
.window-options {
  display: flex; gap: 0.4rem; flex-wrap: wrap;
}
.window-btn {
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: var(--font-mono);
}
.window-btn:hover { border-color: var(--teal); color: var(--teal); }
.window-btn--active {
  background: rgba(0,186,180,0.15);
  border-color: var(--teal);
  color: var(--teal);
}

.active-info { display: flex; flex-direction: column; gap: 0.9rem; }
.info-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 0.88rem; color: var(--text-secondary);
}
.info-row .label { margin-bottom: 0; }

.w-full { width: 100%; }

/* History */
.history-card { display: flex; flex-direction: column; gap: 1rem; min-height: 300px; }
.card-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); }

.empty-state {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 0.75rem; color: var(--text-muted);
  font-size: 0.85rem; padding: 2rem 0;
}

.history-list { display: flex; flex-direction: column; gap: 0.6rem; }

.history-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.75rem 0.9rem;
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  gap: 1rem;
  transition: border-color 0.2s ease;
}
.history-item:hover { border-color: var(--steel-blue); }

.history-left { display: flex; align-items: center; gap: 0.75rem; }
.history-meta {
  display: flex; align-items: center; gap: 0.4rem;
  font-size: 0.78rem; color: var(--text-muted);
}
.dot { color: var(--text-muted); }

.history-right { display: flex; align-items: center; gap: 0.75rem; }

.completion-bar {
  width: 80px; height: 5px;
  background: var(--bg-card);
  border-radius: 99px; overflow: hidden;
}
.completion-fill {
  height: 100%; border-radius: 99px;
  transition: width 0.6s ease, background 0.5s ease;
}

.del-btn {
  background: none; border: none; cursor: pointer;
  color: var(--text-muted);
  padding: 0.25rem;
  border-radius: 4px;
  display: flex; align-items: center;
  transition: color 0.2s ease;
}
.del-btn:hover { color: var(--danger); }

.start-controls { display: flex; flex-direction: column; gap: 1rem; }

@media (max-width: 900px) {
  .fasting-grid { grid-template-columns: 1fr; }
}
</style>

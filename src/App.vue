<template>
  <div class="app-shell">
    <!-- Sidebar nav -->
    <aside class="sidebar">
      <div class="sidebar__logo">
        <div class="logo-icon">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 2C6.03 2 2 6.03 2 11s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" fill="url(#lg1)" opacity=".9"/>
            <path d="M7 11.5l2.5 2.5L15 9" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            <defs>
              <linearGradient id="lg1" x1="2" y1="2" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                <stop stop-color="#00BAB4"/>
                <stop offset="1" stop-color="#069E6E"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span class="logo-text">Mamba<br><em>Health</em></span>
      </div>

      <nav class="sidebar__nav">
        <RouterLink to="/dashboard" class="nav-item" active-class="nav-item--active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          <span>Dashboard</span>
        </RouterLink>

        <RouterLink to="/fasting" class="nav-item" active-class="nav-item--active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          <span>Jejum</span>
          <span v-if="fastingStore.activeFast" class="nav-dot"></span>
        </RouterLink>

        <RouterLink to="/nutrition" class="nav-item" active-class="nav-item--active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
            <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
          </svg>
          <span>Nutrição</span>
        </RouterLink>
      </nav>

      <div class="sidebar__footer">
        <div class="today-chip">
          <span class="label" style="margin-bottom:0">Hoje</span>
          <span class="today-date">{{ formattedDate }}</span>
        </div>
      </div>
    </aside>

    <!-- Mobile bottom nav -->
    <nav class="bottom-nav">
      <RouterLink to="/dashboard" class="bnav-item" active-class="bnav-item--active">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
        <span>Dashboard</span>
      </RouterLink>
      <RouterLink to="/fasting" class="bnav-item" active-class="bnav-item--active">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
        </svg>
        <span>Jejum</span>
      </RouterLink>
      <RouterLink to="/nutrition" class="bnav-item" active-class="bnav-item--active">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
          <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/>
        </svg>
        <span>Nutrição</span>
      </RouterLink>
    </nav>

    <!-- Main content -->
    <main class="main-content">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useFastingStore } from '@/stores/fasting'

const fastingStore = useFastingStore()

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short'
  })
})
</script>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
}

/* ── SIDEBAR ── */
.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: var(--bg-card);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 100;
}

.sidebar__logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 0.4rem 1.75rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 1.5rem;
}

.logo-icon {
  width: 38px; height: 38px;
  background: linear-gradient(135deg, rgba(0,186,180,0.15), rgba(6,158,110,0.15));
  border: 1px solid rgba(0,186,180,0.3);
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.logo-text {
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.25;
  color: var(--text-primary);
}
.logo-text em {
  font-style: normal;
  color: var(--teal);
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 0.85rem;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
}

.nav-item:hover {
  background: var(--bg-surface);
  color: var(--text-primary);
}

.nav-item--active {
  background: linear-gradient(135deg, rgba(0,186,180,0.15), rgba(47,108,130,0.15));
  color: var(--teal);
  font-weight: 600;
}

.nav-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--green);
  margin-left: auto;
  box-shadow: 0 0 6px var(--green);
}

.sidebar__footer {
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}

.today-chip {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.6rem 0.85rem;
}

.today-date {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: capitalize;
}

/* ── MAIN ── */
.main-content {
  flex: 1;
  margin-left: 220px;
  min-height: 100vh;
  padding: 2rem;
  max-width: 1100px;
}

/* ── BOTTOM NAV (mobile) ── */
.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: var(--bg-card);
  border-top: 1px solid var(--border);
  padding: 0.5rem 0 0.75rem;
  z-index: 200;
  justify-content: space-around;
}

.bnav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  text-decoration: none;
  color: var(--text-muted);
  font-size: 0.68rem;
  font-weight: 500;
  padding: 0.3rem 1rem;
  border-radius: var(--radius-sm);
  transition: color 0.2s ease;
}

.bnav-item--active {
  color: var(--teal);
}

@media (max-width: 768px) {
  .sidebar { display: none; }
  .bottom-nav { display: flex; }
  .main-content {
    margin-left: 0;
    padding: 1rem;
    padding-bottom: 5rem;
  }
}
</style>

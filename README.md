# 🐍 Mamba Health Tracker

SPA desenvolvida em Vue.js 3 para controle de saúde — Jejum Intermitente + Monitoramento Calórico.

## Stack

- **Vue 3** + Composition API (`<script setup>`)
- **Pinia** para gerenciamento de estado
- **Vue Router** para navegação SPA
- **Chart.js** + vue-chartjs para gráficos
- **localStorage** para persistência

## Setup

```bash
npm install
npm run dev
```

## Estrutura

```
src/
├── assets/main.css        # Design tokens + utilitários globais
├── router/index.ts        # Rotas SPA
├── stores/
│   ├── fasting.ts         # Store do módulo de jejum
│   └── nutrition.ts       # Store do módulo de nutrição
└── views/
    ├── DashboardView.vue  # Resumo semanal + gráficos
    ├── FastingView.vue    # Controle de jejum com timer
    └── NutritionView.vue  # Registro e progresso calórico
```

## Paleta de Cores

| Token | Hex | Uso |
|-------|-----|-----|
| `--green` | `#069E6E` | Sucesso, metas atingidas |
| `--steel-blue` | `#3E7996` | Elementos secundários |
| `--navy` | `#2D2E47` | Background de cards |
| `--teal` | `#00BAB4` | Acento principal, timers |
| `--ocean` | `#2F6C82` | Gradientes, bordas |

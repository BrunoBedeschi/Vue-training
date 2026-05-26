import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/DashboardView.vue'
import Fasting from '@/views/FastingView.vue'
import Nutrition from '@/views/NutritionView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', name: 'dashboard', component: Dashboard },
    { path: '/fasting',   name: 'fasting',   component: Fasting },
    { path: '/nutrition', name: 'nutrition',  component: Nutrition }
  ]
})

export default router

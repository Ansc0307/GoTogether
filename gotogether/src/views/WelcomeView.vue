<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              <span class="material-symbols-outlined align-middle mr-2">dashboard</span>
              Panel de Control
            </h1>
            <p class="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {{ greetingMessage }}, {{ userName }}
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <button @click="refresh" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <span class="material-symbols-outlined text-gray-600 dark:text-gray-400">refresh</span>
            </button>
            <router-link to="/crear-viaje" class="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              <span class="material-symbols-outlined mr-2 text-sm">add</span>
              Nuevo Viaje
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenido Principal -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Spinner de carga -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Dashboard -->
      <div v-else class="space-y-8">
        <!-- Estadísticas rápidas -->
        <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            v-for="stat in statsCards"
            :key="stat.title"
            :title="stat.title"
            :value="stat.value"
            :icon="stat.icon"
            :trend="stat.trend"
            :color="stat.color"
          />
        </section>

        <!-- Dos columnas principales -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Columna izquierda - Viajes -->
          <section class="lg:col-span-2 space-y-8">
            <!-- Próximos viajes -->
            <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <span class="material-symbols-outlined mr-2 text-primary">flight_takeoff</span>
                  Próximos Viajes
                </h2>
                <router-link to="/misviajes" class="text-sm text-primary hover:text-primary/80 transition-colors">
                  Ver todos
                </router-link>
              </div>
              
              <div v-if="upcomingTrips.length > 0" class="space-y-4">
                <TripCard
                  v-for="trip in upcomingTrips"
                  :key="trip.id"
                  :trip="trip"
                  @click="$router.push(`/trips/${trip.id}/tareas`)"
                />
              </div>
              <div v-else class="text-center py-8">
                <span class="material-symbols-outlined text-gray-400 text-4xl mb-3">travel</span>
                <p class="text-gray-500 dark:text-gray-400">No tienes viajes próximos</p>
                <router-link to="/crear-viaje" class="inline-block mt-3 text-primary hover:text-primary/80">
                  Crear mi primer viaje
                </router-link>
              </div>
            </div>

            <!-- Estado de presupuestos -->
            <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center mb-6">
                <span class="material-symbols-outlined mr-2 text-primary">account_balance_wallet</span>
                Estado de Presupuestos
              </h2>
              <div class="space-y-4">
                <BudgetStatusCard
                  v-for="budget in budgetStatus"
                  :key="budget.id"
                  :budget="budget"
                />
              </div>
            </div>
          </section>

          <!-- Columna derecha - Actividad -->
          <section class="space-y-8">
            <!-- Actividad reciente -->
            <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center mb-6">
                <span class="material-symbols-outlined mr-2 text-primary">history</span>
                Actividad Reciente
              </h2>
              <div class="space-y-4">
                <ActivityItem
                  v-for="activity in recentActivity"
                  :key="activity.id"
                  :activity="activity"
                />
              </div>
            </div>

            <!-- Tareas pendientes -->
            <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <span class="material-symbols-outlined mr-2 text-primary">assignment</span>
                  Tareas Pendientes
                </h2>
                <span class="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">
                  {{ pendingTasks.length }}
                </span>
              </div>
              <div class="space-y-4">
                <TaskItem
                  v-for="task in pendingTasks"
                  :key="task.id"
                  :task="task"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDashboard } from '@/composables/useDashboard'
import StatsCard from '@/components/dashboard/StatsCard.vue'
import TripCard from '@/components/dashboard/TripCard.vue'
import BudgetStatusCard from '@/components/dashboard/BudgetStatusCard.vue'
import ActivityItem from '@/components/dashboard/ActivityItem.vue'
import TaskItem from '@/components/dashboard/TaskItem.vue'

const { dashboardData, stats, loading, refresh } = useDashboard()

const userName = computed(() => {
  return 'Usuario' // Esto debería venir de useAuth
})

const greetingMessage = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
})

const statsCards = computed(() => [
  {
    title: 'Viajes Totales',
    value: stats.value.trips,
    icon: 'travel',
    trend: '+2 este mes',
    color: 'blue'
  },
  {
    title: 'Viajes Activos',
    value: stats.value.active,
    icon: 'flight_takeoff',
    trend: stats.value.active > 0 ? 'En progreso' : 'Sin viajes',
    color: 'green'
  },
  {
    title: 'Tareas Pendientes',
    value: stats.value.pendingTasks,
    icon: 'assignment',
    trend: stats.value.pendingTasks > 0 ? 'Por completar' : 'Al día',
    color: 'orange'
  },
  {
    title: 'Votaciones',
    value: stats.value.votesPending,
    icon: 'how_to_vote',
    trend: 'Participa ahora',
    color: 'purple'
  }
])

const upcomingTrips = computed(() => dashboardData.value.upcomingTrips)
const recentActivity = computed(() => dashboardData.value.recentActivity)
const budgetStatus = computed(() => dashboardData.value.budgetStatus)
const pendingTasks = computed(() => dashboardData.value.pendingTasks || [])

onMounted(() => {
  refresh()
})
</script>
<template>
  <div class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
    <div class="flex items-center space-x-4">
      <!-- Icono del viaje -->
      <div class="p-2 rounded-lg" :class="statusColor.bg">
        <span class="material-symbols-outlined" :class="statusColor.icon">{{ getBudgetIcon }}</span>
      </div>
      
      <!-- Información del presupuesto -->
      <div>
        <h4 class="font-medium text-gray-900 dark:text-white">{{ budget.tripName || 'Viaje' }}</h4>
        <div class="flex items-center space-x-4 mt-1">
          <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <span class="material-symbols-outlined text-xs mr-1">account_balance_wallet</span>
            <span>Bs. {{ formatNumber(budget.spent || 0) }}</span>
          </div>
          <div class="text-sm" :class="statusColor.text">
            <span class="material-symbols-outlined text-xs align-middle mr-1">{{ getStatusIcon }}</span>
            {{ getStatusText }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Barra de progreso -->
    <div class="w-32">
      <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
        <span>{{ percentage }}%</span>
        <span>Bs. {{ formatNumber(budget.total || 0) }}</span>
      </div>
      <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          class="h-full transition-all duration-300" 
          :class="progressBarColor"
          :style="{ width: `${Math.min(percentage, 100)}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  budget: {
    type: Object,
    default: () => ({
      id: '',
      tripName: '',
      total: 0,
      spent: 0,
      status: 'healthy' // healthy, warning, critical
    })
  }
})

const percentage = computed(() => {
  if (!props.budget.total || props.budget.total === 0) return 0
  return Math.round((props.budget.spent / props.budget.total) * 100)
})

const formatNumber = (num) => {
  return parseFloat(num).toLocaleString('es-BO')
}

const getBudgetIcon = computed(() => {
  if (percentage.value > 90) return 'warning'
  if (percentage.value > 70) return 'trending_up'
  return 'trending_flat'
})

const getStatusIcon = computed(() => {
  if (percentage.value > 90) return 'error'
  if (percentage.value > 70) return 'warning'
  return 'check_circle'
})

const getStatusText = computed(() => {
  if (percentage.value > 90) return 'Crítico'
  if (percentage.value > 70) return 'Atención'
  return ' '
})

const statusColor = computed(() => {
  if (percentage.value > 90) {
    return {
      bg: 'bg-red-50 dark:bg-red-900/20',
      icon: 'text-red-600 dark:text-red-400',
      text: 'text-red-600 dark:text-red-400'
    }
  }
  if (percentage.value > 70) {
    return {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      icon: 'text-orange-600 dark:text-orange-400',
      text: 'text-orange-600 dark:text-orange-400'
    }
  }
  return {
    bg: 'bg-green-50 dark:bg-green-900/20',
    icon: 'text-green-600 dark:text-green-400',
    text: 'text-green-600 dark:text-green-400'
  }
})

const progressBarColor = computed(() => {
  if (percentage.value > 90) return 'bg-red-500'
  if (percentage.value > 70) return 'bg-orange-500'
  return 'bg-green-500'
})
</script>
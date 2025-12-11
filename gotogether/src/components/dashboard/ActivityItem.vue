<template>
  <div class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
    <!-- Icono de actividad -->
    <div class="p-2 rounded-lg mt-1" :class="activityType.bg">
      <span class="material-symbols-outlined text-sm" :class="activityType.icon">{{ activityType.iconName }}</span>
    </div>
    
    <!-- Contenido de la actividad -->
    <div class="flex-1 min-w-0">
      <div class="flex items-start justify-between">
        <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ activity.title }}</p>
        <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
          {{ formatTimeAgo(activity.date) }}
        </span>
      </div>
      
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ activity.description }}</p>
      
      <!-- Metadatos adicionales -->
      <div class="flex items-center mt-2 space-x-3">
        <span v-if="activity.tripName" class="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
          <span class="material-symbols-outlined text-xs mr-1">flight_takeoff</span>
          {{ activity.tripName }}
        </span>
        
        <span v-if="activity.status" class="inline-flex items-center text-xs px-2 py-0.5 rounded-full" :class="getStatusClass(activity.status)">
          {{ activity.status }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  activity: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      type: 'task', // 'task', 'vote', 'expense', 'member'
      title: '',
      description: '',
      date: new Date(),
      tripName: '',
      status: ''
    })
  }
})

const activityType = computed(() => {
  const types = {
    task: {
      iconName: 'assignment',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400'
    },
    vote: {
      iconName: 'how_to_vote',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      icon: 'text-purple-600 dark:text-purple-400'
    },
    expense: {
      iconName: 'payments',
      bg: 'bg-green-50 dark:bg-green-900/20',
      icon: 'text-green-600 dark:text-green-400'
    },
    member: {
      iconName: 'group_add',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      icon: 'text-orange-600 dark:text-orange-400'
    }
  }
  
  return types[props.activity.type] || types.task
})

const formatTimeAgo = (date) => {
  const now = new Date()
  const activityDate = new Date(date)
  const diffMs = now - activityDate
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) {
    return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
  } else if (diffHours > 0) {
    return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
  } else if (diffMins > 0) {
    return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`
  } else {
    return 'Justo ahora'
  }
}

const getStatusClass = (status) => {
  const statusClasses = {
    'pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    'completado': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'activo': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'cerrado': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }
  
  return statusClasses[status.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
}
</script>
<template>
  <div class="group p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-primary/50 hover:shadow-sm transition-all duration-200">
    <div class="flex items-start justify-between">
      <div class="flex-1 min-w-0">
        <!-- Título y prioridad -->
        <div class="flex items-center space-x-2 mb-2">
          <h4 class="font-medium text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
            {{ task.title }}
          </h4>
          <span class="text-xs font-medium px-2 py-0.5 rounded-full" :class="priorityClass">
            {{ getPriorityText }}
          </span>
        </div>
        
        <!-- Descripción -->
        <p v-if="task.description" class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {{ task.description }}
        </p>
        
        <!-- Metadatos -->
        <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div class="flex items-center space-x-4">
            <!-- Fecha límite -->
            <span class="flex items-center" :class="deadlineClass">
              <span class="material-symbols-outlined text-xs mr-1">schedule</span>
              <span>{{ formatDate(task.fechaLimite) }}</span>
            </span>
            
            <!-- Viaje relacionado -->
            <span v-if="task.tripName" class="flex items-center">
              <span class="material-symbols-outlined text-xs mr-1">flight_takeoff</span>
              <span class="truncate max-w-[100px]">{{ task.tripName }}</span>
            </span>
          </div>
          
          <!-- Acciones -->
          <div class="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              v-if="!task.completed"
              @click="markAsComplete"
              class="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
              title="Marcar como completada"
            >
              <span class="material-symbols-outlined text-sm">check_circle</span>
            </button>
            <button 
              @click="$emit('view')"
              class="p-1 text-primary hover:bg-primary/10 rounded"
              title="Ver detalles"
            >
              <span class="material-symbols-outlined text-sm">visibility</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Checkbox para completar -->
      <div class="ml-4 flex-shrink-0">
        <button 
          @click="toggleComplete"
          class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
          :class="[task.completed ? completeClass : incompleteClass]"
        >
          <span v-if="task.completed" class="material-symbols-outlined text-sm">check</span>
        </button>
      </div>
    </div>
    
    <!-- Progreso (si es una tarea con subtareas) -->
    <div v-if="task.subtasks && task.subtasks.length > 0" class="mt-3">
      <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
        <span>Progreso</span>
        <span>{{ completedSubtasks }} de {{ task.subtasks.length }}</span>
      </div>
      <div class="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          class="h-full bg-primary transition-all duration-300"
          :style="{ width: `${(completedSubtasks / task.subtasks.length) * 100}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  task: {
    type: Object,
    required: true,
    default: () => ({
      id: '',
      title: '',
      description: '',
      fechaLimite: new Date(),
      priority: 'medium', // 'low', 'medium', 'high', 'urgent'
      completed: false,
      tripName: '',
      subtasks: []
    })
  }
})

const emit = defineEmits(['complete', 'view'])

const getPriorityText = computed(() => {
  const priorities = {
    'low': 'Baja',
    'medium': 'Media',
    'high': 'Alta',
    'urgent': 'Urgente'
  }
  return priorities[props.task.priority] || 'Media'
})

const priorityClass = computed(() => {
  const classes = {
    'low': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    'high': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    'urgent': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  }
  return classes[props.task.priority] || classes.medium
})

const formatDate = (date) => {
  const taskDate = new Date(date)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  // Si es hoy
  if (taskDate.toDateString() === today.toDateString()) {
    return 'Hoy'
  }
  
  // Si es mañana
  if (taskDate.toDateString() === tomorrow.toDateString()) {
    return 'Mañana'
  }
  
  // Si está en los próximos 7 días
  const diffDays = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24))
  if (diffDays > 0 && diffDays <= 7) {
    return `En ${diffDays} día${diffDays > 1 ? 's' : ''}`
  }
  
  // Formato normal
  return taskDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

const deadlineClass = computed(() => {
  const taskDate = new Date(props.task.fechaLimite)
  const today = new Date()
  const diffDays = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'text-red-600 dark:text-red-400'
  if (diffDays === 0) return 'text-orange-600 dark:text-orange-400'
  if (diffDays <= 2) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-gray-500 dark:text-gray-400'
})

const completeClass = computed(() => 
  'border-green-500 bg-green-500 text-white'
)

const incompleteClass = computed(() => 
  'border-gray-300 dark:border-gray-600 hover:border-primary'
)

const completedSubtasks = computed(() => {
  if (!props.task.subtasks) return 0
  return props.task.subtasks.filter(subtask => subtask.completed).length
})

const markAsComplete = () => {
  emit('complete', props.task.id)
}

const toggleComplete = () => {
  emit('complete', props.task.id)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
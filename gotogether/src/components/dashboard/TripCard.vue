<template>
  <div 
    class="group cursor-pointer border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-primary/50 hover:shadow-sm transition-all duration-200"
    @click="$emit('click')"
  >
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
        {{ trip.name }}
      </h3>
      <span class="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors text-sm">
        arrow_forward
      </span>
    </div>
    
    <div class="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
      <span class="material-symbols-outlined text-xs mr-1">location_on</span>
      <span>{{ trip.destination || 'Destino no especificado' }}</span>
    </div>
    
    <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
      <span class="material-symbols-outlined text-xs mr-1">calendar_today</span>
      <span>{{ formatDate(trip.startDate) }} - {{ formatDate(trip.endDate) }}</span>
    </div>
    
    <div class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <div class="flex -space-x-2">
          <div 
            v-for="(member, index) in tripMembers" 
            :key="index"
            class="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-700 border border-white dark:border-gray-900 flex items-center justify-center text-xs"
          >
            {{ getInitial(member) }}
          </div>
          <div 
            v-if="trip.members?.length > 3"
            class="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 border border-white dark:border-gray-900 flex items-center justify-center text-xs text-gray-500"
          >
            +{{ trip.members.length - 3 }}
          </div>
        </div>
        <span class="text-xs text-gray-500">{{ trip.members?.length || 0 }} miembros</span>
      </div>
      <span class="text-sm font-medium px-2 py-1 rounded" :class="budgetColor">
        Bs. {{ formatBudget(trip.budget) }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  trip: {
    type: Object,
    required: true
  }
})

defineEmits(['click'])

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

const formatBudget = (budget) => {
  if (!budget) return '0'
  return parseFloat(budget).toLocaleString('es-BO')
}

const getInitial = (email) => {
  if (!email) return '?'
  return email[0]?.toUpperCase() || '?'
}

const tripMembers = computed(() => {
  if (!props.trip.members) return []
  return Array.isArray(props.trip.members) 
    ? props.trip.members.slice(0, 3) 
    : []
})

const budgetColor = computed(() => {
  const budget = parseFloat(props.trip.budget) || 0
  if (budget > 10000) return 'text-green-700 bg-green-50 dark:bg-green-900/20'
  if (budget > 5000) return 'text-blue-700 bg-blue-50 dark:bg-blue-900/20'
  return 'text-gray-700 bg-gray-50 dark:bg-gray-800'
})
</script>
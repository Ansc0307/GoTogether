<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <button
      v-for="action in actions"
      :key="action.title"
      @click="$emit('action', action.type)"
      class="flex flex-col items-center p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-primary/50 hover:shadow-sm transition-all duration-200 group"
    >
      <div class="p-3 rounded-lg mb-3" :class="action.color.bg">
        <span class="material-symbols-outlined text-xl" :class="action.color.icon">{{ action.icon }}</span>
      </div>
      <span class="font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">
        {{ action.title }}
      </span>
      <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {{ action.description }}
      </span>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const actions = ref([
  {
    type: 'new-trip',
    title: 'Nuevo Viaje',
    description: 'Crea un viaje',
    icon: 'add',
    color: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400'
    }
  },
  {
    type: 'invite-friends',
    title: 'Invitar Amigos',
    description: 'Añade compañeros',
    icon: 'group_add',
    color: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      icon: 'text-green-600 dark:text-green-400'
    }
  },
  {
    type: 'add-expense',
    title: 'Agregar Gasto',
    description: 'Registra un gasto',
    icon: 'payments',
    color: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      icon: 'text-orange-600 dark:text-orange-400'
    }
  },
  {
    type: 'view-calendar',
    title: 'Ver Calendario',
    description: 'Planifica fechas',
    icon: 'calendar_month',
    color: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      icon: 'text-purple-600 dark:text-purple-400'
    }
  }
])

defineEmits(['action'])
</script>
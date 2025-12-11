<template>
  <div class="text-center py-8">
    <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
      <span class="material-symbols-outlined text-2xl text-gray-400">{{ icon }}</span>
    </div>
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">{{ title }}</h3>
    <p class="text-gray-600 dark:text-gray-400 max-w-sm mx-auto mb-6">{{ description }}</p>
    <slot>
      <button 
        v-if="actionText"
        @click="$emit('action')"
        class="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
      >
        <span class="material-symbols-outlined mr-2 text-sm">{{ actionIcon }}</span>
        {{ actionText }}
      </button>
    </slot>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: 'info'
  },
  title: {
    type: String,
    default: 'No hay datos'
  },
  description: {
    type: String,
    default: 'No se encontraron elementos para mostrar'
  },
  actionText: {
    type: String,
    default: ''
  },
  actionIcon: {
    type: String,
    default: 'add'
  }
})

defineEmits(['action'])
</script>
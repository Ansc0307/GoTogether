<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">{{ title }}</p>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white">{{ value }}</h3>
        <p class="text-xs mt-2" :class="trendColor">{{ trend }}</p>
      </div>
      <div class="p-3 rounded-lg" :class="iconBgColor">
        <span class="material-symbols-outlined text-xl" :class="iconColor">{{ icon }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  value: [String, Number],
  icon: String,
  trend: String,
  color: {
    type: String,
    default: 'blue'
  }
})

const colorMap = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'text-blue-600 dark:text-blue-400' },
  green: { bg: 'bg-green-50 dark:bg-green-900/20', icon: 'text-green-600 dark:text-green-400' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', icon: 'text-orange-600 dark:text-orange-400' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'text-purple-600 dark:text-purple-400' }
}

const iconBgColor = computed(() => colorMap[props.color].bg)
const iconColor = computed(() => colorMap[props.color].icon)
const trendColor = computed(() => {
  if (props.trend?.includes('+')) return 'text-green-600'
  if (props.trend?.includes('-')) return 'text-red-600'
  return 'text-gray-500'
})
</script>
<!-- CalendarViewSwitcher.vue -->
<template>
  <div class="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
    <button
      @click="$emit('change','day')"
      :class="buttonClass('day')"
    >
      Día
    </button>

    <button
      @click="$emit('change','week')"
      :class="buttonClass('week')"
    >
      Semana
    </button>

    <button
      @click="$emit('change','month')"
      :class="buttonClass('month')"
    >
      Mes
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  current: String
})

const buttonClass = (view) =>
  `px-3 py-1.5 rounded-md transition font-medium
   ${props.current === view
      ? 'bg-white text-black shadow-sm dark:bg-white dark:text-black'
      : 'text-gray-500 hover:bg-white hover:text-black dark:text-gray-300'}
  `
</script>

<style scoped>
button {
  font-size: 0.85rem;
}
</style>

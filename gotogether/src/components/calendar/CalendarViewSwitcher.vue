<template>
  <div class="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg overflow-x-auto sm:overflow-visible whitespace-nowrap sm:whitespace-normal">
    <button
      @click="$emit('change','day')"
      :class="buttonClass('day')"
      :aria-pressed="props.current === 'day'"
    >
      <span class="inline-block sm:hidden">D</span>
      <span class="hidden sm:inline">Día</span>
    </button>

    <button
      @click="$emit('change','week')"
      :class="buttonClass('week')"
      :aria-pressed="props.current === 'week'"
    >
      <span class="inline-block sm:hidden">S</span>
      <span class="hidden sm:inline">Semana</span>
    </button>

    <button
      @click="$emit('change','month')"
      :class="buttonClass('month')"
      :aria-pressed="props.current === 'month'"
    >
      <span class="inline-block sm:hidden">M</span>
      <span class="hidden sm:inline">Mes</span>
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  current: String
})

const buttonClass = (view) =>
  `px-3 py-1.5 rounded-md transition font-medium text-sm sm:text-base flex-shrink-0
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
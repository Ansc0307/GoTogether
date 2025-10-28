<!-- /components/trips/TripNavbar.vue -->
<template>
  <nav class="mt-6 border-b border-gray-200 overflow-x-auto scrollbar-hide">
    <ul class="flex gap-6 text-gray-600 font-medium min-w-max px-2">
      <li>
        <RouterLink
          :to="`/trips/${tripId}/tareas`"
          class="hover:text-primary"
          active-class="text-primary border-b-2 border-primary pb-1"
        >
          Tareas
        </RouterLink>
      </li>
      <li>
        <RouterLink
          :to="`/trips/${tripId}/presupuesto`"
          class="hover:text-primary"
          active-class="text-primary border-b-2 border-primary pb-1"
        >
          Presupuesto
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script setup>
defineProps({
  tripId: String,
});
</script>

<style scoped>
/* Oculta la barra de scroll horizontal en la mayoría de navegadores */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none; /* IE y Edge */
  scrollbar-width: none; /* Firefox */
}
</style>

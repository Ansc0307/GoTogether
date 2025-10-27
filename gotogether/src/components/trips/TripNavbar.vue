<!-- /components/trips/TripNavbar.vue -->
<template>
  <nav
    class="mt-6 border-b border-gray-200 overflow-x-auto scrollbar-hide"
  >
    <ul
      class="flex gap-6 text-gray-600 font-medium min-w-max px-2"
    >
      <li>
        <button @click="alertTab('tareas')" class="hover:text-primary whitespace-nowrap">
          Tareas
        </button>
      </li>
      <li>
        <button @click="alertTab('itinerario')" class="hover:text-primary whitespace-nowrap">
          Itinerario
        </button>
      </li>
      <li>
        <button @click="alertTab('presupuesto')" class="hover:text-primary whitespace-nowrap">
          Presupuesto
        </button>
      </li>
      <li>
        <button @click="alertTab('votaciones')" class="hover:text-primary whitespace-nowrap">
          Votaciones
        </button>
      </li>
      <li>
        <button @click="alertTab('mapa')" class="hover:text-primary whitespace-nowrap">
          Mapa
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup>
const props = defineProps({
  tripId: String,
});

const alertTab = (tab) => {
  alert(`Se presionó la pestaña ${tab} del viaje con id: ${props.tripId}`);
};
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

<!-- /components/trips/TripNavbar.vue -->
<template>
  <nav class="mt-6 border-b border-gray-200">
    <ul class="flex gap-6 text-gray-600 font-medium">
      <li>
        <button @click="alertTab('tareas')" class="hover:text-primary">
          Tareas
        </button>
      </li>
      <li>
        <button @click="alertTab('itinerario')" class="hover:text-primary">
          Itinerario
        </button>
      </li>
      <li>
        <button @click="alertTab('presupuesto')" class="hover:text-primary">
          Presupuesto
        </button>
      </li>
      <li>
        <button @click="alertTab('votaciones')" class="hover:text-primary">
          Votaciones
        </button>
      </li>
      <li>
        <button @click="alertTab('mapa')" class="hover:text-primary">
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

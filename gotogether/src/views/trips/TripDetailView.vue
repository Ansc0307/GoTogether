<!-- /views/trips/TripDetailView.vue -->
<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold mb-4">Detalles del viaje</h1>

    <TripNavbar :tripId="tripId" />

    <div class="mt-6">
      <!-- Aquí se cargan las secciones (Tareas, Itinerario, etc.) -->
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import TripNavbar from "../../components/trips/TripNavbar.vue";

const route = useRoute();
const tripId = route.params.tripId;
</script>

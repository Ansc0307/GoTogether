<!-- /views/trips/TripDashboard.vue -->
 <!-- /views/TripDashboard.vue -->
<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <!-- Cabecera del viaje -->
    <TripHeader :trip="trip" />

    <!-- Navbar de secciones -->
    <TripNavbar :tripId="trip.id" />

    <!-- Contenido principal -->
    <div class="mt-8">
      <h2 class="text-2xl font-semibold mb-4 text-gray-800">
        Itinerario del Viaje
      </h2>

      <div class="bg-white rounded-lg shadow p-6">
        <p class="text-gray-600">
          Aquí aparecerá el itinerario con los eventos y actividades del viaje.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import TripHeader from "../../components/trips/TripHeader.vue";
import TripNavbar from "../../components/trips/TripNavbar.vue";
import { ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

// Por ahora valores estáticos
const trip = ref({
  id: route.params.id,
  name: "Aventura en el Salar de Uyuni",
  startDate: new Date("2024-02-15"),
  endDate: new Date("2024-02-22"),
  members: ["user1", "user2", "user3"],
});
</script>

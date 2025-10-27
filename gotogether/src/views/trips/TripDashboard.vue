<!-- /views/trips/TripDashboard.vue -->
<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div v-if="loading" class="text-center text-gray-500 py-10">
      Cargando información del viaje...
    </div>

    <div v-else-if="!trip" class="text-center text-gray-500 py-10">
      No se encontró el viaje solicitado.
    </div>

    <div v-else>
      <!-- Cabecera del viaje -->
      <TripHeader :trip="trip" />

      <!-- Navbar -->
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
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

import TripHeader from "../../components/trips/TripHeader.vue";
import TripNavbar from "../../components/trips/TripNavbar.vue";

const route = useRoute();
const trip = ref(null);
const loading = ref(true);

const fetchTrip = async () => {
  try {
    const tripId = route.params.id;
    const docRef = doc(db, "trips", tripId);
    const tripSnap = await getDoc(docRef);

    if (tripSnap.exists()) {
      trip.value = { id: tripSnap.id, ...tripSnap.data() };

      // 🔧 Si aún no hay campo members, lo inicializamos con un "default user"
      if (!trip.value.members) {
        trip.value.members = [
          {
            id: "default-user",
            name: "Usuario Explorador",
            avatar: "/assets/default-avatar.png", // 👈 Usa tu ícono genérico
          },
        ];
      }
    } else {
      trip.value = null;
    }
  } catch (error) {
    console.error("Error al obtener viaje:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchTrip);
</script>

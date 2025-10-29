<!-- /components/trips/TripList.vue -->
<template>
  <div v-if="loading" class="text-center py-12 text-gray-500">
    Cargando tus viajes...
  </div>

  <div
    v-else-if="viajes.length === 0"
    class="flex flex-col items-center justify-center text-center"
  >
    <img
      src="../../assets/empty_trips.png"
      alt="Sin viajes"
      class="w-64 h-64 object-contain mb-6 opacity-90"
    />
    <h2 class="text-2xl font-semibold text-gray-800">
      Aún no tienes ningún viaje planificado.
    </h2>
    <p class="text-gray-500 mt-2 max-w-md">
      ¡Anímate a crear el primero y comienza a planificar tu próxima aventura!
    </p>
    <button
      @click="$emit('crearViaje')"
      class="mt-6 bg-primary text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-primary/90 transition flex items-center gap-2"
    >
      <span class="material-symbols-outlined">add</span>
      Crear Nuevo Viaje
    </button>
  </div>

  <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <TripCard
      v-for="trip in viajes"
      :key="trip.id"
      :trip="trip"
      :isOrganizer="trip.createdBy === currentUser?.email"
      @click="$router.push(`/trips/${trip.id}/tareas`)"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { db } from "../../firebase/firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import TripCard from "./TripCard.vue";

const viajes = ref([]);
const loading = ref(true);
const currentUser = ref(null);
let unsubscribe = null;

onMounted(() => {
  const auth = getAuth();
  currentUser.value = auth.currentUser;

  const tripsRef = collection(db, "trips");

  // 🔥 Escucha en tiempo real
  unsubscribe = onSnapshot(
    tripsRef,
    (snapshot) => {
      const allTrips = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const userEmail = currentUser.value?.email;

      viajes.value = allTrips.filter((trip) => {
        const isOrganizer = trip.createdBy === userEmail;
        const isMember = Array.isArray(trip.members)
          ? trip.members.includes(userEmail)
          : false;
        return isOrganizer || isMember;
      });

      loading.value = false;
    },
    (error) => {
      console.error("Error al escuchar viajes:", error);
      loading.value = false;
    }
  );
});

onBeforeUnmount(() => {
  if (unsubscribe) unsubscribe(); // Detiene la suscripción al desmontar el componente
});
</script>

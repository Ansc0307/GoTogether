<!-- /components/trips/TripList.vue -->
<template>
  <!-- Mostrar indicador de carga -->
  <div v-if="loading" class="text-center py-12 text-gray-500">
    Cargando tus viajes...
  </div>

  <!-- Si no hay viajes -->
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
      ¡Anímate a crear el primero y comienza a planificar tu próxima aventura
      con amigos y familiares!
    </p>
    <button
      @click="$emit('crearViaje')"
      class="mt-6 bg-primary text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-primary/90 transition flex items-center gap-2"
    >
      <span class="material-symbols-outlined">add</span>
      Crear Nuevo Viaje
    </button>
  </div>

  <!-- Si hay viajes -->
  <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
    <TripCard
      v-for="trip in viajes"
      :key="trip.id"
      :trip="trip"
      class="cursor-pointer"
      @click="$router.push(`/trip/${trip.id}`)"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { db } from "../../firebase/firebaseConfig";
import { collection, getDocs, query } from "firebase/firestore";
import TripCard from "./TripCard.vue"; // 👈 importa el componente

// 🔐 Cuando haya login:
// import { getAuth } from "firebase/auth";

const viajes = ref([]);
const loading = ref(true);

const fetchViajes = async () => {
  loading.value = true;

  try {
    // 🔐 En el futuro (cuando haya login):
    // const auth = getAuth();
    // const user = auth.currentUser;
    // const userId = user ? user.uid : null;
    // const q = userId
    //   ? query(collection(db, "trips"), where("userId", "==", userId))
    //   : query(collection(db, "trips"), where("userId", "==", "default-user"));

    // Por ahora (sin login):
    const q = query(collection(db, "trips"));
    const querySnapshot = await getDocs(q);

    viajes.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error al obtener viajes:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchViajes();
});
</script>


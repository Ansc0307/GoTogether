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
      <li>
        <RouterLink
          :to="`/trips/${tripId}/mapa`"
          class="hover:text-primary"
          active-class="text-primary border-b-2 border-primary pb-1"
        >
          Mapa
        </RouterLink>
      </li>
      <li>
        <RouterLink
          :to="`/trips/${tripId}/votaciones`"
          class="hover:text-primary"
          active-class="text-primary border-b-2 border-primary pb-1"
        >
          Votaciones
        </RouterLink>
      </li>
            <li>
        <RouterLink
          :to="`/trips/${tripId}/itinerario`"
          class="hover:text-primary"
          active-class="text-primary border-b-2 border-primary pb-1"
        >
          Itinerario
        </RouterLink>
      </li>

      <!-- Botón de edición solo para organizadores -->
      <li v-if="isOrganizer">
        <button
          @click="showEditModal = true"
          class="hover:text-primary font-semibold"
        >
          Edición Viaje
        </button>
      </li>
    </ul>

    <!-- Modal de edición -->
    <EditTripForm
      v-if="showEditModal"
      :visible="showEditModal"
      :trip-id="tripId"
      @close="showEditModal = false"
    />
  </nav>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import EditTripForm from "./EditTripForm.vue";
import { db, auth } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

// Props
const props = defineProps({
  tripId: String
});

// Estado modal
const showEditModal = ref(false);
const tripData = ref(null);
const currentUserEmail = ref("");

// Computed para mostrar botón si es organizador
const isOrganizer = computed(() => {
  if (!tripData.value || !currentUserEmail.value) return false;
  return tripData.value.createdBy === currentUserEmail.value;
});

const fetchTripData = async () => {
  try {
    const ref = doc(db, "trips", props.tripId);
    const snap = await getDoc(ref);
    if (snap.exists()) tripData.value = snap.data();
  } catch (e) {
    console.error("Error al cargar trip en navbar:", e);
  }
};

onMounted(async () => {
  // Esperar que Firebase Auth cargue usuario
  const user = auth.currentUser;
  if (user) currentUserEmail.value = user.email;

  // Cargar datos del viaje
  await fetchTripData();
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

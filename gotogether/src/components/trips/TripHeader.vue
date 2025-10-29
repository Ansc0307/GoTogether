<!-- /components/trips/TripHeader.vue -->
<template>
  <div class="relative bg-gray-900 text-white rounded-xl overflow-hidden shadow-md -mt-14">
    <img
      src="../../assets/default_trip_image1.jpg" 
      alt="Imagen del viaje"
      class="w-full h-56 object-cover opacity-70"
    />

    <div
      class="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent"
    >
      <h1 class="text-3xl font-bold">{{ trip.name }}</h1>
      <p class="text-gray-200 text-sm mt-1">
        {{ formatDate(trip.startDate) }} – {{ formatDate(trip.endDate) }}
      </p>

      <!-- Miembros -->
      <div class="flex items-center mt-3">
        <div class="flex -space-x-2">
          <img
            v-for="(member, index) in displayedMembers"
            :key="index"
            :src="getUserAvatar(member)"
            :alt="member.name || member.email"
            class="w-9 h-9 rounded-full border-2 border-white bg-white object-cover"
          />
        </div>

        <!-- Mostrar solo si hay más de 4 -->
        <span
          v-if="trip.members.length > maxDisplay"
          class="ml-3 text-sm text-gray-300"
        >
          +{{ trip.members.length - maxDisplay }} más
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { db } from "../../firebase/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const props = defineProps({
  trip: {
    type: Object,
    required: true,
  },
});

const auth = getAuth();
const displayedMembers = ref([]);
const maxDisplay = 4;

// 🔥 Busca los datos de usuario (nombre y foto) en la colección 'users'
const fetchMembersData = async () => {
  try {
    if (!props.trip.members || props.trip.members.length === 0) {
      displayedMembers.value = [];
      return;
    }

    const membersEmails = props.trip.members.slice(0, maxDisplay);
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "in", membersEmails));
    const snapshot = await getDocs(q);

    // Crear un mapa email -> userData
    const userMap = {};
    snapshot.forEach((doc) => {
      userMap[doc.data().email] = doc.data();
    });

    // Generar la lista visual (con fallback si no hay en BD)
    displayedMembers.value = membersEmails.map((email) => ({
      email,
      name: userMap[email]?.name || email.split("@")[0],
      photoURL: userMap[email]?.photoURL || null,
    }));
  } catch (error) {
    console.error("Error al cargar miembros:", error);
  }
};

onMounted(fetchMembersData);
watch(() => props.trip.members, fetchMembersData, { deep: true });

// 📅 Formato de fechas
const formatDate = (date) => {
  if (!date) return "—";
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getUserAvatar = (member) => {
  // Si es el usuario actual de Firebase
  if (auth.currentUser && member.email === auth.currentUser.email) {
    return auth.currentUser.photoURL || 
      `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(member.email)}`
  }

  // Si el miembro tiene foto guardada en Firestore
  if (member.photoURL) return member.photoURL;

  // Si no, avatar genérico
  const seed = member.email || member.name || "default";
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede,d1d4f9`;
};
</script>

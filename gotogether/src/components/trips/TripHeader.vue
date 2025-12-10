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

      <!-- SECCIÓN DEL ALIAS DEL USUARIO LOGUEADO -->
      <div 
        v-if="currentUserInTrip && !isLoadingAlias"
        class="mt-3 mb-2 p-2 bg-white/10 backdrop-blur-sm rounded-lg inline-flex items-center gap-2 self-start"
      >
        <span class="text-sm text-gray-300">Tú apareces como:</span>
        <span class="font-bold text-white">{{ userAlias || userDisplayName }}</span>
        <button
          @click="openEditAliasModal"
          class="ml-1 p-1 hover:bg-white/20 rounded transition"
          title="Cambiar mi alias"
        >
          <span class="material-symbols-outlined text-base">edit</span>
        </button>
      </div>

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

  <!-- MODAL (llamado como componente) -->
  <EditarMiAliasModal
    v-if="showAliasModal"
    :tripId="trip.id"
    :tripName="trip.name"
    :currentAlias="userAlias"
    :userEmail="currentUserEmail"
    :userDisplayName="userDisplayName"
    @close="showAliasModal = false"
    @alias-updated="handleAliasUpdated"
  />
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { db, auth } from "../../firebase/firebaseConfig";
import { 
  collection, 
  getDocs, 
  query, 
  where,
  doc,
  getDoc
} from "firebase/firestore";
import EditarMiAliasModal from "../modals/EditarMiAliasModal.vue";

const props = defineProps({
  trip: {
    type: Object,
    required: true,
  },
});

const displayedMembers = ref([]);
const maxDisplay = 4;
const showAliasModal = ref(false);
const userAlias = ref(null);
const isLoadingAlias = ref(false);
const currentUserEmail = ref("");

// Computed: ¿El usuario actual está en el viaje?
const currentUserInTrip = computed(() => {
  if (!auth.currentUser || !props.trip?.members) return false;
  return props.trip.members.includes(auth.currentUser.email);
});

// Computed: Nombre de display del usuario
const userDisplayName = computed(() => {
  if (auth.currentUser?.displayName) return auth.currentUser.displayName;
  if (auth.currentUser?.email) return auth.currentUser.email.split("@")[0];
  return "Usuario";
});

// Cargar alias personalizado del usuario en este viaje (CORREGIDO)
const loadUserAlias = async () => {
  if (!auth.currentUser || !props.trip?.id) {
    userAlias.value = null;
    return;
  }

  isLoadingAlias.value = true;
  try {
    const tripRef = doc(db, "trips", props.trip.id);
    const tripSnap = await getDoc(tripRef);
    
    if (tripSnap.exists()) {
      const tripData = tripSnap.data();
      
      // 🔍 CORRECCIÓN: Buscar en el campo 'alias' que es donde se guarda
      if (tripData.alias && tripData.alias[auth.currentUser.email]) {
        // Estructura correcta: alias como objeto {email: alias}
        userAlias.value = tripData.alias[auth.currentUser.email];
      } else {
        userAlias.value = null; // No tiene alias personalizado
      }
    } else {
      userAlias.value = null;
    }
  } catch (error) {
    console.error("Error cargando alias:", error);
    userAlias.value = null;
  } finally {
    isLoadingAlias.value = false;
  }
};

// Abrir modal de edición
const openEditAliasModal = () => {
  currentUserEmail.value = auth.currentUser?.email || "";
  showAliasModal.value = true;
};

// Manejar actualización de alias
const handleAliasUpdated = (newAlias) => {
  userAlias.value = newAlias;
  // Recargar datos después de actualizar
  setTimeout(() => {
    loadUserAlias();
  }, 500);
};

// 👥 Busca datos de usuarios para avatares
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

    const userMap = {};
    snapshot.forEach((doc) => {
      userMap[doc.data().email] = doc.data();
    });

    displayedMembers.value = membersEmails.map((email) => ({
      email,
      name: userMap[email]?.name || email.split("@")[0],
      photoURL: userMap[email]?.photoURL || null,
    }));
  } catch (error) {
    console.error("Error al cargar miembros:", error);
  }
};

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
  // Si es el usuario actual
  if (auth.currentUser && member.email === auth.currentUser.email) {
    return auth.currentUser.photoURL || 
      `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(member.email)}`;
  }

  // Si el miembro tiene foto guardada en Firestore
  if (member.photoURL) return member.photoURL;

  // Si no, avatar genérico
  const seed = member.email || member.name || "default";
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede,d1d4f9`;
};

// 🔄 Watchers y lifecycle
onMounted(async () => {
  if (auth.currentUser) {
    currentUserEmail.value = auth.currentUser.email;
    if (currentUserInTrip.value) {
      await loadUserAlias();
    }
  }
  await fetchMembersData();
});

watch(() => props.trip.members, fetchMembersData, { deep: true });
watch(() => props.trip.id, loadUserAlias);
</script>
<template>
  <div class="flex flex-col h-[calc(100vh-200px)] max-w-3xl mx-auto">
    
    <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4">
      Chat del Viaje
    </h2>

    <div ref="chatContainer" class="flex-1 space-y-4 overflow-y-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow-inner">
      
      <div v-if="loading" class="text-center text-gray-500">
        Cargando mensajes...
      </div>

      <div v-else-if="messages.length === 0" class="text-center text-gray-500">
        Aún no hay mensajes. ¡Sé el primero en saludar!
      </div>
      
      <div 
        v-for="message in messages" 
        :key="message.id" 
        class="flex items-start gap-3"
        :class="{ 'justify-end': message.senderId === user?.uid }"
      >
        <img 
          v-if="message.senderId !== user?.uid"
          :src="getAvatar(message.senderPhotoURL, message.senderName)" 
          :alt="message.senderName" 
          class="h-10 w-10 rounded-full flex-shrink-0"
        />

        <div 
          class="max-w-xs md:max-w-md rounded-lg p-3 shadow-sm"
          :class="{
            'bg-slate-100 dark:bg-slate-700': message.senderId !== user?.uid,
            'bg-primary text-white': message.senderId === user?.uid
          }"
        >
          <p 
            v-if="message.senderId !== user?.uid"
            class="text-sm font-semibold text-primary dark:text-blue-300 mb-1"
          >
            {{ message.senderName }}
          </p>
          <p class="text-base">{{ message.text }}</p>
          <p class="text-xs opacity-70 mt-1 text-right">
            {{ formatTimestamp(message.timestamp) }}
          </p>
        </div>
      </div>
    </div>

    <form @submit.prevent="sendMessage" class="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
      <div class="relative">
        <input 
          v-model="newMessage"
          class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-3 pl-4 pr-28 text-slate-800 dark:text-slate-200" 
          placeholder="Escribe un mensaje..." 
          type="text"
          :disabled="!user"
        />
        <button 
          type="submit" 
          class="absolute inset-y-0 right-2 top-2 bottom-2 flex items-center"
          :disabled="!user || newMessage.trim() === ''"
        >
          <span class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50">
            Enviar
          </span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { db } from '@/firebase/firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';

const route = useRoute();
const { user } = useAuth(); // Tu composable de autenticación

const tripId = ref(route.params.id);
const messages = ref([]);
const newMessage = ref('');
const loading = ref(true);
const chatContainer = ref(null); // Para el autoscroll
let unsubscribe = null;

// --- 1. Función para hacer scroll al final ---
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
};

// --- 2. Obtener mensajes en tiempo real ---
onMounted(() => {
  if (!tripId.value) return;

  // Esta es la "ruta" de la base de datos de la que hablamos
  // No es una carpeta de tu proyecto.
  const chatColRef = collection(db, 'trips', tripId.value, 'chat');
  const q = query(chatColRef, orderBy('timestamp', 'asc'));

  unsubscribe = onSnapshot(q, (snapshot) => {
    messages.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    loading.value = false;
    scrollToBottom(); // Hacer scroll cada vez que lleguen mensajes nuevos
  }, (error) => {
    console.error("Error al cargar chat:", error);
    loading.value = false;
  });
});

// --- 3. Desuscribirse al salir ---
onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

// --- 4. Enviar un mensaje ---
const sendMessage = async () => {
  if (newMessage.value.trim() === '' || !user.value || !tripId.value) return;

  const chatColRef = collection(db, 'trips', tripId.value, 'chat');
  
  try {
    await addDoc(chatColRef, {
      text: newMessage.value,
      senderId: user.value.uid,
      senderName: user.value.displayName || user.value.email, // Aquí usaremos el nombre del perfil (Tarea 1)
      senderPhotoURL: user.value.photoURL || '', // Y la foto de perfil (Tarea 1)
      timestamp: serverTimestamp()
    });
    newMessage.value = ''; // Limpiar el input
    scrollToBottom(); // Scroll al enviar
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
  }
};

// --- 5. Funciones de ayuda ---
const getAvatar = (photoURL, name) => {
  if (photoURL) return photoURL;
  const seed = name || 'default';
  // Avatar genérico si no hay foto
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed)}`;
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  let date;
  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate();
  } else if (timestamp && timestamp.seconds) {
    // Si viene de Firestore
    date = new Date(timestamp.seconds * 1000);
  } else {
    return ''; // Timestamp aún no está disponible (serverTimestamp)
  }
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};
</script>
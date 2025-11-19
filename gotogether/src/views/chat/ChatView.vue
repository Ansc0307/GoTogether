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
      
      <div v-for="(message, idx) in messages" :key="message.id">
        <!-- Date separator -->
          <div v-if="showDateSeparator(idx)" class="text-center text-xs text-gray-400 my-2">
            {{ formatDateSeparator(message.timestamp) }}
          </div>

        <div 
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
            {{ resolveDisplayName(message) }}
          </p>
          <p class="text-base">{{ message.text }}</p>
          <p class="text-xs opacity-70 mt-1 text-right">
            {{ formatTimestamp(message.timestamp) }}
          </p>
          <!-- Reactions -->
          <div class="mt-2 flex gap-2 items-center">
            <template v-for="emoji in ['❤️','👍','😂','😮']" :key="emoji">
              <button
                @click.prevent="toggleReaction(message, emoji)"
                class="text-sm px-2 py-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <span class="mr-1">{{ emoji }}</span>
                <span class="text-xs text-gray-600">{{ (message.reactions && message.reactions[emoji]) ? message.reactions[emoji].length : 0 }}</span>
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    </div>

    <!-- Typing indicator -->
    <div v-if="typingUsersFiltered.length" class="px-4 py-2 text-sm text-gray-500">
      {{ typingUsersFiltered.join(', ') }} {{ typingUsersFiltered.length > 1 ? 'están' : 'está' }} escribiendo...
    </div>

    <form @submit.prevent="sendMessage" class="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
      <div class="relative">
        <textarea
          v-model="newMessage"
          @keydown="onKeyDown"
          @input="startTyping"
          rows="2"
          class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-3 pl-4 pr-28 text-slate-800 dark:text-slate-200 resize-none"
          placeholder="Escribe un mensaje... (Enter para enviar, Shift+Enter para nueva línea)"
          :disabled="!user || isSending"
        ></textarea>

        <button 
          type="submit" 
          class="absolute inset-y-0 right-2 top-2 bottom-2 flex items-center"
          :disabled="!user || newMessage.trim() === '' || isSending"
        >
          <span class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
            <svg v-if="isSending" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            Enviar
          </span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp, doc, getDoc, setDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { db } from '@/firebase/firebaseConfig';

const route = useRoute();
const { user } = useAuth(); // Tu composable de autenticación

const tripId = ref(route.params.id);
const messages = ref([]);
const newMessage = ref('');
const loading = ref(true);
const chatContainer = ref(null); // Para el autoscroll
const tripAliases = ref({});
const typingUsers = ref([]);
let typingTimeout = null;
let unsubscribe = null;
const isSending = ref(false);

// --- 1. Función para hacer scroll al final ---
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
};

// --- 2. Obtener mensajes en tiempo real ---
onMounted(async () => {
  if (!tripId.value) return;
  //cargar el alias del miembro
  try {
    const tripDocRef = doc(db, 'trips', tripId.value);
    const tripSnap = await getDoc(tripDocRef);
    if (tripSnap.exists()) {
      tripAliases.value = tripSnap.data().alias || {};
    }
  } catch (e) {
    console.error("Error al cargar datos del viaje:", e);
  }

  // Esta es la "ruta" de la base de datos
  const chatColRef = collection(db, 'trips', tripId.value, 'chat');
  const q = query(chatColRef, orderBy('timestamp', 'asc'));

  // Listener para usuarios que están escribiendo
  try {
    const typingColRef = collection(db, 'trips', tripId.value, 'typing');
    onSnapshot(typingColRef, (snap) => {
      typingUsers.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    });
  } catch (e) {
    console.warn('No pudo iniciar listener de typing:', e);
  }

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
    // remove typing doc for current user
    stopTypingImmediate();
    if (unsubscribe) unsubscribe();
  });

// --- 4. Enviar un mensaje ---
const sendMessage = async () => {
  if (newMessage.value.trim() === '' || !user.value || !tripId.value) return;

  const chatColRef = collection(db, 'trips', tripId.value, 'chat');
  
  const userEmail = user.value.email;
  // Busca el alias en el mapa que cargamos, usando el email del usuario como llave
  const senderAlias = tripAliases.value[userEmail];
  
  // Usa el alias si existe; si no, usa el displayName; si no, usa el email.
  const finalSenderName = senderAlias || user.value.displayName || user.value.email;
  
  try {
    isSending.value = true;
    await addDoc(chatColRef, {
      text: newMessage.value,
      senderId: user.value.uid,
      senderEmail: userEmail,
      senderName: finalSenderName, // 👈 USA LA NUEVA VARIABLE
      senderPhotoURL: user.value.photoURL || '', 
      timestamp: serverTimestamp(),
      reactions: {}
    });
    newMessage.value = ''; 
    scrollToBottom();
    isSending.value = false;
  } catch (error) {
    isSending.value = false;
    console.error("Error al enviar mensaje:", error);
  }
};

// Typing indicator helpers
const startTyping = async () => {
  if (!user.value || !tripId.value) return;
  try {
    const typingRef = doc(db, 'trips', tripId.value, 'typing', user.value.uid);
    await setDoc(typingRef, { name: user.value.displayName || user.value.email, email: user.value.email, lastActive: serverTimestamp() });
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(async () => {
      try { await deleteDoc(typingRef); } catch (_) {}
    }, 3000);
  } catch (e) {
    console.warn('startTyping error', e);
  }
};

const stopTypingImmediate = async () => {
  if (!user.value || !tripId.value) return;
  try {
    const typingRef = doc(db, 'trips', tripId.value, 'typing', user.value.uid);
    await deleteDoc(typingRef);
  } catch (e) { }
  if (typingTimeout) { clearTimeout(typingTimeout); typingTimeout = null; }
};

// Toggle reaction: uses arrayUnion/arrayRemove on reactions.<emoji>
const toggleReaction = async (message, emoji) => {
  if (!user.value || !tripId.value || !message?.id) return;
  try {
    const msgRef = doc(db, 'trips', tripId.value, 'chat', message.id);
    const userId = user.value.uid;
    const currentReactions = message.reactions || {};
    const usersForEmoji = currentReactions[emoji] || [];
    const hasReacted = usersForEmoji.includes(userId);
    if (hasReacted) {
      await updateDoc(msgRef, { [`reactions.${emoji}`]: arrayRemove(userId) });
    } else {
      await updateDoc(msgRef, { [`reactions.${emoji}`]: arrayUnion(userId) });
    }
  } catch (e) {
    console.error('toggleReaction error', e);
  }
};

// Handle Enter to send, Shift+Enter for newline
const onKeyDown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
};

// Resolve display name for a message: prefer message.senderName, then alias map by senderEmail, then fallback to senderName or senderEmail
const resolveDisplayName = (message) => {
  if (!message) return '';
  if (message.senderName) return message.senderName;
  const email = message.senderEmail;
  return (email && tripAliases.value[email]) ? tripAliases.value[email] : (message.senderName || email || 'Usuario');
};

const typingUsersFiltered = computed(() => {
  return typingUsers.value
    .filter(u => u.id !== user.value?.uid)
    .map(u => u.name || u.email || 'Usuario');
});

// Date separator helpers
const showDateSeparator = (idx) => {
  if (idx === 0) return true;
  const cur = messages.value[idx];
  const prev = messages.value[idx - 1];
  if (!cur || !prev) return false;
  const curDate = getDateOnly(cur.timestamp);
  const prevDate = getDateOnly(prev.timestamp);
  return curDate.getTime() !== prevDate.getTime();
};

const formatDateSeparator = (timestamp) => {
  const date = getDateOnly(timestamp);
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = Math.floor((todayDate - date) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getDateOnly = (timestamp) => {
  if (!timestamp) return new Date(0);
  if (timestamp instanceof Timestamp) return new Date(timestamp.toDate().getFullYear(), timestamp.toDate().getMonth(), timestamp.toDate().getDate());
  if (timestamp && timestamp.seconds) {
    const d = new Date(timestamp.seconds * 1000);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  const d = new Date(timestamp);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
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
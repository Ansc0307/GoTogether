<template>
  <div class="min-h-screen flex flex-col items-center justify-center text-center px-6 py-10 bg-background -mt-16">
    <!-- Spinner (mientras carga) -->
    <LoadingSpinner v-if="loading" message="Cargando perfil..." />

    <!-- Contenido principal -->
    <div v-else class="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
      <!-- Imagen de perfil -->
      <div class="flex justify-center mb-6">
        <img
          :src="getUserAvatar(userInfo)"
          :alt="userInfo.displayName || 'Usuario'"
          class="w-28 h-28 rounded-full shadow-md border border-gray-200 dark:border-gray-700 object-cover"
        />
      </div>

      <!-- Bienvenida -->
      <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
        ¡Bienvenid@{{ userInfo.displayName ? ',' : '' }} 
        <span class="text-primary">
          {{ userInfo.displayName || 'viajero' }}
        </span>!
      </h1>

      <p class="mt-3 text-gray-600 dark:text-gray-400">
        Nos alegra verte aquí. Tu cuenta está activa y lista para explorar las nuevas aventuras que vienen. 🌍✈️
      </p>

      <!-- Mensaje de desarrollo -->
      <div class="mt-8 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">
          🚧 Más funcionalidades en camino
        </h2>
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          Estamos trabajando en nuevas características para mejorar tu experiencia. ¡Pronto podrás probarlas!
        </p>
      </div>

      <!-- Botón de acción -->
      <div class="mt-10">
        <router-link
          to="/misviajes"
          class="inline-block px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
        >
          Ir a mis viajes
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LoadingSpinner from '@/components/budget/LoadingSpinner.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

// Estado local
const userInfo = ref(null)
const loading = ref(true)

// Recuperar datos del usuario autenticado
const auth = getAuth()
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      userInfo.value = {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      }
    }
    loading.value = false
  })
})

// Avatar por defecto o personalizado
const getUserAvatar = (user) => {
  if (user?.photoURL) return user.photoURL
  const seed = user?.email || user?.displayName || 'default'
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede,d1d4f9`
}
</script>

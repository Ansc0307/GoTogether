

<template>
  <div id="app" class="min-h-screen w-full flex flex-col bg-background-light dark:bg-background-dark">
    <!-- Navbar personalizado (reemplaza el header de Tailwind) -->
    <AppNavbar 
      :showNavigation="showFullNavigation"
      :userInfo="mockUser"
      :showNotifications="showFullNavigation"
      :notificationCount="3"
      @navigation-click="handleNavigation"
      @notifications-click="handleNotifications"
      @profile-click="handleProfile"
      @login-click="handleLogin"
      @signup-click="handleSignup"
    />
    
    <main class="flex-1 px-4 md:px-10 py-6 md:py-10 flex justify-center items-start">
      <div class="w-full max-w-[1200px]">
        <router-view />
      </div>
    </main>
    
    <!-- Componente de prueba para Firebase (temporal) -->
    <div class="dev-section">
      <details>
        <summary>🧪 Pruebas de Firebase (Dev)</summary>
        <TestFirebase />
      </details>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
import TestFirebase from './components/TestFirebase.vue'

const router = useRouter()
const route = useRoute()

// Usuario mock para pruebas (esto vendrá de Firebase Auth después)
// null = no autenticado, object = autenticado
const mockUser = ref({
  displayName: 'Josh Morales',
  email: 'josh@gotogether.com',
  photoURL: null
})

// Determinar si mostrar navegación completa (solo en páginas autenticadas)
const showFullNavigation = computed(() => {
  return route.path !== '/' && mockUser.value !== null
})

// Handlers para el navbar
const handleNavigation = (section) => {
  console.log('Navegando a:', section)
  
  switch(section) {
    case 'home':
      router.push('/')
      break
    case 'trips':
      // Temporal: redirigir a una lista de viajes (próximamente)
      alert('Lista de viajes - Próximamente')
      break
    case 'chat':
      // Temporal: Chat grupal (Persona responsable del chat lo implementará)
      alert('Chat grupal - Próximamente (RF5)')
      break
    case 'voting':
      router.push('/voting')
      break
    case 'expenses':
      router.push('/presupuesto')
      break
    case 'tasks':
      // Temporal: Lista de tareas (próximamente)
      alert('Lista de tareas - Próximamente')
      break
    case 'itinerary':
      // Temporal: Itinerario (próximamente)
      alert('Itinerario - Próximamente')
      break
    case 'maps':
      // Temporal: Mapas (próximamente)
      alert('Mapas - Próximamente')
      break
    case 'overview':
      // Para cuando estés dentro de un viaje específico
      alert('Resumen del viaje - Próximamente')
      break
    case 'manage':
      // Solo para organizadores
      alert('Gestionar viaje - Próximamente')
      break
    default:
      console.log('Sección no reconocida:', section)
  }
}

const handleNotifications = () => {
  console.log('Ver notificaciones')
  // Aquí irá la lógica de notificaciones
}

const handleProfile = () => {
  console.log('Ver perfil')
  // Aquí irá la lógica del perfil
}

const handleLogin = () => {
  console.log('Login clicked')
  // Aquí irá la lógica de login con Firebase Auth
  router.push('/voting') // temporal - simular login
}

const handleSignup = () => {
  console.log('Signup clicked')
  // Aquí irá la lógica de registro con Firebase Auth
  router.push('/voting') // temporal - simular registro
}
</script>

<style>
/* Todo el estilo viene de Tailwind */

/* Sección de desarrollo temporal */
.dev-section {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  max-width: 300px;
  z-index: 1000;
}

.dev-section details {
  padding: 1rem;
}

.dev-section summary {
  cursor: pointer;
  font-weight: 600;
  color: #1313ec;
  margin-bottom: 1rem;
}

.dev-section summary:hover {
  color: #0f0fcb;
}
</style>

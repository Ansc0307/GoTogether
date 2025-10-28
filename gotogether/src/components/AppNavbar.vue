<template>
	<header class="app-navbar">
		<div class="container">
			<div class="brand" @click="$emit('navigation-click','home')">
				<span class="logo" aria-hidden="true">🚐</span>
				<span class="name">GoTogether</span>
			</div>

			<nav v-if="showNavigation" class="nav">
				<button class="nav-link" @click="$emit('navigation-click','trips')">Viajes</button>
				<button class="nav-link" @click="$emit('navigation-click','voting')">Votaciones</button>
				<button class="nav-link" @click="$emit('navigation-click','expenses')">Presupuesto</button>
				<button class="nav-link" @click="$emit('navigation-click','tasks')">Tareas</button>
			</nav>

			<div class="right">
				<button v-if="showNotifications" class="icon-btn" @click="$emit('notifications-click')" aria-label="Notificaciones">
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
					<span v-if="notificationCount" class="badge">{{ notificationCount }}</span>
				</button>

				<div v-if="userInfo" class="user" @click="$emit('profile-click')">
					<span class="avatar">{{ initials(userInfo.displayName || userInfo.email) }}</span>
					<span class="label">{{ userInfo.displayName || 'Usuario' }}</span>
				</div>

				<div v-else class="auth">
					<button class="link" @click="$emit('login-click')">Entrar</button>
					<button class="primary" @click="$emit('signup-click')">Crear cuenta</button>
				</div>
			</div>
		</div>
	</header>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
	showNavigation: { type: Boolean, default: false },
	userInfo: { type: Object, default: null },
	showNotifications: { type: Boolean, default: false },
	notificationCount: { type: Number, default: 0 }
})

// Emits
const emit = defineEmits([
  'navigation-click',
  'notifications-click', 
  'profile-click',
  'login-click',
  'signup-click'
])

// Local state
const mobileMenuOpen = ref(false)

const navigationItems = computed(() => {
  if (!props.showNavigation) return []

  if (props.tripName) {
    return [
      { key: 'overview', label: 'Resumen', href: '/' },
      { key: 'chat', label: 'Chat', href: '/chat' },
      { key: 'voting', label: 'Votaciones', href: '/voting' },
      { key: 'expenses', label: 'Gastos', href: '/presupuesto' },
      { key: 'tasks', label: 'Tareas', href: '/tareas' },
      { key: 'itinerary', label: 'Itinerario', href: '/itinerario' },
      { key: 'maps', label: 'Mapas', href: '/maps' },
      ...(props.userRole === 'organizer' ? [
        { key: 'manage', label: 'Gestionar', href: '/manage' }
      ] : [])
    ]
  }

  return [
    { key: 'home', label: 'Inicio', href: '/' },
    { key: 'trips', label: 'Mis Viajes', href: '/misviajes' },
    { key: 'chat', label: 'Chat', href: '/chat' },
    { key: 'voting', label: 'Votaciones', href: '/voting' },
    { key: 'expenses', label: 'Presupuesto', href: '/presupuesto' },
    { key: 'tasks', label: 'Tareas', href: '/tareas' },
    { key: 'itinerary', label: 'Itinerario', href: '/itinerario' },
    { key: 'maps', label: 'Mapas', href: '/maps' }
  ]
})

const getUserAvatar = (user) => {
  if (user.photoURL) return user.photoURL
  
  const seed = user.email || user.displayName || 'default'
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede,d1d4f9`
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const handleNavClick = (key, event) => {
  event.preventDefault()
  emit('navigation-click', key)
  mobileMenuOpen.value = false
}

const handleMobileNavClick = (key, event) => {
  event.preventDefault()
  emit('navigation-click', key)
  mobileMenuOpen.value = false
}

const initials = (name = '') => {
	return name
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map(n => n[0]?.toUpperCase())
		.join('') || 'U'
}
</script>

<style scoped>
.app-navbar { background:#ffffff; border-bottom:1px solid #e2e8f0; position:sticky; top:0; z-index:50 }
.container { max-width:1200px; margin:0 auto; padding:.75rem 1rem; display:flex; align-items:center; justify-content:space-between; gap:1rem }
.brand { display:flex; align-items:center; gap:.5rem; cursor:pointer; }
.logo { font-size:1.1rem }
.name { font-weight:800; color:#0f172a }
.nav { display:flex; gap:.75rem }
.nav-link { background:transparent; border:none; color:#334155; padding:.4rem .6rem; border-radius:.375rem; cursor:pointer; font-weight:600 }
.nav-link:hover { background:#f1f5f9 }
.right { display:flex; align-items:center; gap:.75rem }
.icon-btn { position:relative; display:inline-flex; align-items:center; justify-content:center; width:36px; height:36px; border:1px solid #e2e8f0; border-radius:.5rem; background:#f8fafc; cursor:pointer }
.badge { position:absolute; top:-6px; right:-6px; background:#ef4444; color:#fff; font-size:.7rem; border-radius:999px; padding:0 .4rem }
.user { display:flex; align-items:center; gap:.5rem; cursor:pointer }
.avatar { width:28px; height:28px; border-radius:999px; background:#dbeafe; color:#1e3a8a; display:inline-flex; align-items:center; justify-content:center; font-weight:800; border:1px solid #bfdbfe }
.label { color:#0f172a; font-weight:700; font-size:.9rem }
.auth { display:flex; align-items:center; gap:.5rem }
.link { background:transparent; border:none; color:#2563eb; font-weight:700; cursor:pointer }
.primary { background:#2563eb; color:#fff; border:none; padding:.45rem .75rem; border-radius:.5rem; font-weight:700; cursor:pointer }
.primary:hover { background:#1d4ed8 }
</style>

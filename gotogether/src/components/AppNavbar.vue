<template>
  <header class="app-navbar">
    <div class="navbar-container">
      <!-- Logo -->
      <div class="logo-section">
        <div class="logo-placeholder">
          <img :src="logoImg" alt="GoTogether Logo" />
        </div>
      </div>
      
      <!-- Navegación principal (solo si está autenticado) -->
      <nav v-if="showNavigation" class="main-navigation">
        <a 
          v-for="navItem in navigationItems" 
          :key="navItem.key"
          :href="navItem.href || '#'"
          class="nav-link"
          :class="{ 'active': currentSection === navItem.key }"
          @click="handleNavClick(navItem.key, $event)"
        >
          {{ navItem.label }}
        </a>
      </nav>
      
      <!-- Acciones del usuario -->
      <div class="user-actions">
        <!-- Notificaciones (solo si está autenticado) -->
        <button 
          v-if="showNotifications" 
          class="notification-btn"
          @click="$emit('notifications-click')"
          :aria-label="'Notificaciones' + (notificationCount > 0 ? ` (${notificationCount})` : '')"
        >
          <span class="notification-icon">🔔</span>
          <span v-if="notificationCount > 0" class="notification-badge">
            {{ notificationCount > 99 ? '99+' : notificationCount }}
          </span>
        </button>
        
        <!-- Avatar del usuario (solo si está autenticado) -->
        <div 
          v-if="userInfo" 
          class="user-avatar"
          @click="$emit('profile-click')"
        >
          <img 
            :src="getUserAvatar(userInfo)" 
            :alt="userInfo.displayName || 'Usuario'"
            class="avatar-image"
          />
        </div>
        
        <!-- Botones de acceso (solo si NO está autenticado) -->
        <div v-else class="auth-buttons">
          <button class="login-btn" @click="$emit('login-click')">
            Iniciar Sesión
          </button>
          <button class="signup-btn" @click="$emit('signup-click')">
            Registrarse
          </button>
        </div>
      </div>
      
      <!-- Menú móvil hamburger -->
      <button 
        v-if="showNavigation"
        class="mobile-menu-btn"
        @click="toggleMobileMenu"
        :aria-expanded="mobileMenuOpen"
        aria-label="Menú de navegación"
      >
        <span class="hamburger-line" :class="{ 'open': mobileMenuOpen }"></span>
        <span class="hamburger-line" :class="{ 'open': mobileMenuOpen }"></span>
        <span class="hamburger-line" :class="{ 'open': mobileMenuOpen }"></span>
      </button>
    </div>
    
    <!-- Menú móvil desplegable -->
    <nav 
      v-if="showNavigation && mobileMenuOpen" 
      class="mobile-navigation"
    >
      <a 
        v-for="navItem in navigationItems" 
        :key="navItem.key"
        :href="navItem.href || '#'"
        class="mobile-nav-link"
        :class="{ 'active': currentSection === navItem.key }"
        @click="handleMobileNavClick(navItem.key, $event)"
      >
        {{ navItem.label }}
      </a>
    </nav>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import logoImg from '../assets/logo.png'

// Props
const props = defineProps({
  // Información básica
  appName: {
    type: String,
    default: 'GoTogether'
  },
  tripName: {
    type: String,
    default: ''
  },
  
  // Estado de autenticación
  userInfo: {
    type: Object,
    default: null
    // Estructura esperada: { displayName, email, photoURL, role }
  },
  
  // Configuración de navegación
  showNavigation: {
    type: Boolean,
    default: false
  },
  currentSection: {
    type: String,
    default: ''
  },
  userRole: {
    type: String,
    default: 'member', // 'organizer', 'member'
    validator: (value) => ['organizer', 'member'].includes(value)
  },
  
  // Notificaciones
  showNotifications: {
    type: Boolean,
    default: false
  },
  notificationCount: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits([
  'navigation-click',
  'notifications-click', 
  'profile-click',
  'login-click',
  'signup-click'
])

// Estado local
const mobileMenuOpen = ref(false)

// Computed
const navigationItems = computed(() => {
  if (!props.showNavigation) return []
  
  // Si está en un viaje específico, mostrar navegación del viaje
  if (props.tripName) {
    return [
      { key: 'overview', label: 'Resumen', href: '#' },
      { key: 'chat', label: 'Chat', href: '#' },
      { key: 'voting', label: 'Votaciones', href: '#' },
      { key: 'expenses', label: 'Gastos', href: '#' },
      { key: 'tasks', label: 'Tareas', href: '#' },
      { key: 'itinerary', label: 'Itinerario', href: '#' },
      { key: 'maps', label: 'Mapas', href: '#' },
      ...(props.userRole === 'organizer' ? [
        { key: 'manage', label: 'Gestionar', href: '#' }
      ] : [])
    ]
  }
  
  // Navegación principal (cuando no está en un viaje específico)
  return [
    { key: 'home', label: 'Inicio', href: '#' },
    { key: 'trips', label: 'Mis Viajes', href: '#' },
    { key: 'chat', label: 'Chat', href: '#' },
    { key: 'voting', label: 'Votaciones', href: '#' },
    { key: 'expenses', label: 'Presupuesto', href: '#' },
    { key: 'tasks', label: 'Tareas', href: '#' },
    { key: 'itinerary', label: 'Itinerario', href: '#' },
    { key: 'maps', label: 'Mapas', href: '#' }
  ]
})

// Methods
const getInitials = (name) => {
  if (!name) return '??'
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

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
</script>

<style scoped>
/* Navbar base */
.app-navbar {
  background: #ffffff;
  border-bottom: 2px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4.5rem;
}

/* Logo section */
.logo-section {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.logo-placeholder {
  width: 11rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: transparent;
}

.logo-placeholder img {
  width: 200%;
  height: 200%;
  object-fit: contain;
}

.logo-text {
  color: white;
  font-weight: bold;
  font-size: 0.875rem;
}

.app-name {
  font-size: 1.25rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0;
  display: none;
}

.trip-badge {
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.375rem 0.875rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

/* Navigation */
.main-navigation {
  display: none;
  gap: 1.25rem;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.main-navigation::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.nav-link {
  text-decoration: none;
  color: #6b7280;
  font-weight: 500;
  font-size: 0.875rem;
  transition: color 0.2s ease;
  padding: 0.5rem 0;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  flex-shrink: 0;
}

.nav-link:hover {
  color: #1313ec;
}

.nav-link.active {
  color: #1313ec;
  border-bottom-color: #1313ec;
}

/* User actions */
.user-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.notification-btn {
  position: relative;
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.notification-btn:hover {
  background-color: #f3f4f6;
}

.notification-icon {
  font-size: 1.125rem;
}

.notification-badge {
  position: absolute;
  top: 0.125rem;
  right: 0.125rem;
  background: #ef4444;
  color: white;
  font-size: 0.625rem;
  font-weight: bold;
  padding: 0.125rem 0.375rem;
  border-radius: 0.75rem;
  min-width: 1.125rem;
  text-align: center;
}

.user-avatar {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border: 2px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background: #f1f5f9;
}

.user-avatar:hover {
  transform: scale(1.08);
  border-color: #2563eb;
  box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
}

/* Auth buttons */
.auth-buttons {
  display: flex;
  gap: 0.75rem;
}

.login-btn,
.signup-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.login-btn {
  background: none;
  border: 1px solid #d1d5db;
  color: #374151;
}

.login-btn:hover {
  background-color: #f9fafb;
}

.signup-btn {
  background: #1313ec;
  border: 1px solid #1313ec;
  color: white;
}

.signup-btn:hover {
  background: #0f0fcb;
}

/* Mobile menu button */
.mobile-menu-btn {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 1.5rem;
  height: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.hamburger-line {
  width: 100%;
  height: 2px;
  background: #374151;
  transition: all 0.3s ease;
  transform-origin: center;
}

.hamburger-line.open:nth-child(1) {
  transform: rotate(45deg) translate(0.25rem, 0.25rem);
}

.hamburger-line.open:nth-child(2) {
  opacity: 0;
}

.hamburger-line.open:nth-child(3) {
  transform: rotate(-45deg) translate(0.25rem, -0.25rem);
}

/* Mobile navigation */
.mobile-navigation {
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mobile-nav-link {
  text-decoration: none;
  color: #6b7280;
  font-weight: 500;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
  transition: color 0.2s ease;
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
  color: #1313ec;
}

/* Responsive */
@media (min-width: 768px) {
  .main-navigation {
    display: flex;
  }
  
  .mobile-menu-btn {
    display: none;
  }
  
  .navbar-container {
    padding: 0 2rem;
  }
  
  .logo-placeholder {
    width: 14rem;
    height: 4rem;
  }
  
  .user-avatar {
    width: 3rem;
    height: 3rem;
  }
  
  .avatar-initials {
    font-size: 1rem;
  }
}

@media (min-width: 1024px) {
  .navbar-container {
    padding: 0 3rem;
  }
  
  .logo-placeholder {
    width: 16rem;
    height: 4.5rem;
  }
}
</style>
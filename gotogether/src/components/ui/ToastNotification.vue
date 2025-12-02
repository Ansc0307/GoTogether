<!-- components/ui/ToastNotification.vue -->
<template>
  <Transition name="toast">
    <div 
      v-if="visible"
      class="fixed bottom-4 right-4 z-50 max-w-sm w-full"
    >
      <div 
        class="p-4 rounded-lg shadow-lg border flex items-start gap-3 animate-slideIn"
        :class="toastClasses"
      >
        <!-- Icono -->
        <span class="material-symbols-outlined flex-shrink-0 mt-0.5">
          {{ icon }}
        </span>
        
        <!-- Contenido -->
        <div class="flex-1 min-w-0">
          <p class="font-medium">{{ message }}</p>
          <p v-if="details" class="text-sm opacity-90 mt-1">{{ details }}</p>
        </div>
        
        <!-- Botón cerrar -->
        <button 
          @click="close"
          class="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5"
        >
          <span class="material-symbols-outlined text-base">close</span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 5000
  },
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const visible = ref(props.show)
let timeoutId = null

// Iconos según tipo
const icon = computed(() => {
  switch (props.type) {
    case 'success': return 'check_circle'
    case 'error': return 'error'
    case 'warning': return 'warning'
    default: return 'info'
  }
})

// Clases CSS según tipo
const toastClasses = computed(() => {
  const base = 'bg-white border'
  
  switch (props.type) {
    case 'success':
      return `${base} border-green-200 text-green-800`
    case 'error':
      return `${base} border-red-200 text-red-800`
    case 'warning':
      return `${base} border-yellow-200 text-yellow-800`
    default:
      return `${base} border-blue-200 text-blue-800`
  }
})

// Cerrar notificación
const close = () => {
  visible.value = false
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
  emit('close')
}

// Auto-cerrar después de la duración
const startAutoClose = () => {
  if (props.duration > 0) {
    timeoutId = setTimeout(close, props.duration)
  }
}

// Watch para mostrar/ocultar
watch(() => props.show, (newVal) => {
  visible.value = newVal
  if (newVal) {
    startAutoClose()
  } else if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
})

// Inicializar
onMounted(() => {
  if (visible.value) {
    startAutoClose()
  }
})

// Limpiar timeout al desmontar
onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
})
</script>

<style scoped>
/* Animaciones */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slideIn {
  animation: slideIn 0.3s ease-out;
}

/* Transición Vue */
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
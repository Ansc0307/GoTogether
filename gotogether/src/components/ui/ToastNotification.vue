<!-- components/ui/ToastNotification.vue -->
<template>
  <div
    v-if="visible"
    class="fixed bottom-4 right-4 z-50 animate-fadeIn"
  >
    <div 
      class="p-4 rounded-lg border shadow-lg max-w-sm"
      :class="toastClasses"
    >
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined">
          {{ icon }}
        </span>
        <div class="flex-1">
          <p class="font-medium">{{ message }}</p>
          <p v-if="details" class="text-sm mt-1 opacity-90">{{ details }}</p>
        </div>
        <button @click="close" class="text-gray-400 hover:text-gray-600">
          <span class="material-symbols-outlined text-base">close</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  type: { type: String, default: 'info' },
  message: { type: String, required: true },
  details: { type: String, default: '' },
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const visible = ref(props.show)
let timeout

// Icono según tipo
const icon = computed(() => {
  switch (props.type) {
    case 'success': return 'check_circle'
    case 'error': return 'error'
    case 'warning': return 'warning'
    default: return 'info'
  }
})

// Clases CSS
const toastClasses = computed(() => {
  switch (props.type) {
    case 'success': return 'bg-green-50 border-green-200 text-green-800'
    case 'error': return 'bg-red-50 border-red-200 text-red-800'
    case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    default: return 'bg-blue-50 border-blue-200 text-blue-800'
  }
})

// Cerrar
const close = () => {
  visible.value = false
  clearTimeout(timeout)
  emit('close')
}

// Auto-cerrar después de 5 segundos
const startTimer = () => {
  timeout = setTimeout(close, 5000)
}

// Watch para mostrar/ocultar
watch(() => props.show, (newVal) => {
  visible.value = newVal
  if (newVal) startTimer()
})

onMounted(() => {
  if (visible.value) startTimer()
})
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
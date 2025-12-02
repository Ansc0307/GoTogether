<!-- components/trips/DeleteTripModal.vue -->
<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Fondo oscuro -->
    <div class="fixed inset-0 bg-black/60 transition-opacity" @click="emit('cancel')"></div>
    
    <!-- Contenedor del modal -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all">
        <!-- Contenido del modal -->
        <div class="p-6">
          <!-- Icono de advertencia -->
          <div class="flex items-center justify-center mb-4">
            <div class="p-3 bg-red-100 rounded-full">
              <span class="material-symbols-outlined text-red-600 text-3xl">warning</span>
            </div>
          </div>
          
          <!-- Título -->
          <h3 class="text-xl font-bold text-gray-900 text-center mb-3">
            Eliminar viaje permanentemente
          </h3>
          
          <!-- Mensaje -->
          <div class="text-center mb-6">
            <p class="text-gray-600 mb-2">
              ¿Estás seguro de que quieres eliminar el viaje
              <span class="font-semibold text-gray-900">"{{ tripName }}"</span>?
            </p>
            <p class="text-sm text-gray-500 leading-relaxed">
              Esta acción no se puede deshacer. Se eliminarán permanentemente:
            </p>
            
            <!-- Lista de elementos a eliminar -->
            <ul class="mt-3 text-sm text-gray-500 text-left space-y-1">
              <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-base text-gray-400">close</span>
                Todas las tareas y actividades
              </li>
              <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-base text-gray-400">close</span>
                Historial de chat completo
              </li>
              <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-base text-gray-400">close</span>
                Presupuestos y gastos registrados
              </li>
              <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-base text-gray-400">close</span>
                Itinerarios y votaciones
              </li>
              <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-base text-gray-400">close</span>
                Puntos en el mapa
              </li>
            </ul>
          </div>
          
          <!-- Confirmación adicional -->
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <label class="flex items-start gap-3 cursor-pointer">
              <input
                v-model="confirmed"
                type="checkbox"
                class="mt-1 text-red-600 rounded focus:ring-red-500 focus:ring-2 focus:ring-offset-0"
                :disabled="deleting"
              />
              <div>
                <p class="text-sm font-medium text-red-800">
                  Comprendo las consecuencias y deseo continuar
                </p>
                <p class="text-xs text-red-600 mt-1">
                  Esta acción eliminará todos los datos asociados al viaje
                </p>
              </div>
            </label>
          </div>
          
          <!-- Contador de seguridad -->
          <div v-if="showCountdown" class="mb-6">
            <div class="text-center">
              <div class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600 font-bold text-lg">
                {{ countdown }}
              </div>
              <p class="text-xs text-gray-500 mt-2">
                Se eliminará automáticamente en {{ countdown }} segundos
              </p>
            </div>
          </div>
          
          <!-- Botones -->
          <div class="flex flex-col sm:flex-row gap-3">
            <button
              @click="emit('cancel')"
              class="btn-outline flex-1 py-3"
              :disabled="deleting"
            >
              Cancelar
            </button>
            <button
              @click="confirmDelete"
              class="btn bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2 flex-1 py-3"
              :disabled="!confirmed || deleting"
              :class="{'opacity-50 cursor-not-allowed': !confirmed}"
            >
              <span v-if="deleting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              <span v-else class="material-symbols-outlined text-base">delete</span>
              {{ deleting ? 'Eliminando...' : 'Sí, eliminar' }}
            </button>
          </div>
          
          <!-- Advertencia final -->
          <p class="text-xs text-gray-400 text-center mt-6">
            Esta acción no puede revertirse. Por favor, asegúrate de tener un respaldo si necesitas los datos.
          </p>
        </div>
        
        <!-- Botón cerrar (X) -->
        <button
          @click="emit('cancel')"
          class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
          :disabled="deleting"
        >
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useTrips } from '@/composables/useTrips'

const props = defineProps({
  tripId: String,
  tripName: String,
  enableCountdown: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['confirm', 'cancel'])

// Composable
const { deleteTrip, isLoading: deleting } = useTrips()

// Estado local
const confirmed = ref(false)
const showCountdown = ref(false)
const countdown = ref(5)
let countdownInterval = null

// Activar cuenta regresiva cuando se marca el checkbox
const startCountdown = () => {
  if (!props.enableCountdown) return
  
  showCountdown.value = true
  countdown.value = 5
  
  countdownInterval = setInterval(() => {
    if (countdown.value > 1) {
      countdown.value--
    } else {
      clearInterval(countdownInterval)
      confirmDelete()
    }
  }, 1000)
}

// Detener cuenta regresiva
const stopCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
  showCountdown.value = false
}

// Watch para iniciar/detener cuenta regresiva
watch(confirmed, (newVal) => {
  if (newVal && props.enableCountdown) {
    startCountdown()
  } else {
    stopCountdown()
  }
})

// Confirmar eliminación
const confirmDelete = async () => {
  if (!confirmed.value) return
  
  stopCountdown()
  
  try {
    const result = await deleteTrip(props.tripId)
    
    if (result.success) {
      // Emitir confirmación después de un pequeño delay para mejor UX
      setTimeout(() => {
        emit('confirm')
      }, 300)
    } else {
      alert(`Error al eliminar el viaje: ${result.error}`)
    }
  } catch (error) {
    console.error('Error en confirmDelete:', error)
    alert('Ocurrió un error inesperado al eliminar el viaje')
  }
}

// Limpiar intervalos al desmontar
onUnmounted(() => {
  stopCountdown()
})

// Resetear estado al cancelar
const handleCancel = () => {
  stopCountdown()
  confirmed.value = false
  emit('cancel')
}
</script>

<style scoped>
/* Animación de entrada del modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
}
</style>
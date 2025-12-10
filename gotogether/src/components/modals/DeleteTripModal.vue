<!-- components/trips/DeleteTripModal.vue -->
<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
      <!-- Icono -->
      <div class="flex items-center justify-center mb-4">
        <div class="p-3 bg-red-100 rounded-full">
          <span class="material-symbols-outlined text-red-600 text-3xl">warning</span>
        </div>
      </div>
      
      <!-- Título -->
      <h3 class="text-xl font-bold text-gray-800 text-center mb-3">
        Eliminar viaje
      </h3>
      
      <!-- Mensaje -->
      <div class="text-center mb-6">
        <p class="text-gray-600 mb-2">
          ¿Eliminar el viaje <strong>"{{ tripName }}"</strong>?
        </p>
        <p class="text-sm text-gray-500">
          Esta acción no se puede deshacer.
        </p>
      </div>
      
      <!-- Confirmación -->
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <label class="flex items-start gap-3 cursor-pointer">
          <input
            v-model="confirmed"
            type="checkbox"
            class="mt-1 text-red-600 rounded"
          />
          <div>
            <p class="text-sm font-medium text-red-800">
              Entiendo que se eliminarán todos los datos
            </p>
          </div>
        </label>
      </div>
      
      <!-- Botones -->
      <div class="flex gap-3">
        <button
          @click="$emit('cancel')"
          class="btn-outline flex-1"
          :disabled="deleting"
        >
          Cancelar
        </button>
        <button
          @click="confirmDelete"
          class="btn bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2 flex-1"
          :disabled="!confirmed || deleting"
        >
          <span v-if="deleting" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
          <span v-else class="material-symbols-outlined text-base">delete</span>
          {{ deleting ? 'Eliminando...' : 'Eliminar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTrips } from '@/composables/useTrips'

const props = defineProps({
  tripId: String,
  tripName: String
})

const emit = defineEmits(['confirm', 'cancel'])

const { deleteTrip, isLoading: deleting } = useTrips()
const confirmed = ref(false)

const confirmDelete = async () => {
  if (!confirmed.value) return
  
  const result = await deleteTrip(props.tripId)
  
  if (result.success) {
    emit('confirm')
  } else {
    alert(`Error: ${result.error}`)
  }
}
</script>
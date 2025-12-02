<!-- components/trips/EditTripForm.vue -->
<template>
  <div>
    <!-- Formulario principal -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <form @submit.prevent="saveChanges" class="space-y-6">
        <!-- Nombre del viaje -->
        <div>
          <label class="label">
            Nombre del viaje
            <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            class="input"
            placeholder="Ej: Aventura en los Andes"
            required
            :disabled="isLoading"
          />
          <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
        </div>

        <!-- Destino -->
        <div>
          <label class="label">Destino específico</label>
          <input
            v-model="form.destination"
            type="text"
            class="input"
            placeholder="Ej: Salar de Uyuni, Lago Titicaca"
            :disabled="isLoading"
          />
        </div>

        <!-- Fechas -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="label">
              Fecha de inicio
              <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.startDate"
              type="date"
              class="input"
              required
              :disabled="isLoading"
            />
            <p v-if="errors.startDate" class="mt-1 text-sm text-red-600">{{ errors.startDate }}</p>
          </div>
          <div>
            <label class="label">
              Fecha de fin
              <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.endDate"
              type="date"
              class="input"
              required
              :disabled="isLoading"
            />
            <p v-if="errors.endDate" class="mt-1 text-sm text-red-600">{{ errors.endDate }}</p>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-100">
          <!-- Botón eliminar -->
          <button
            type="button"
            @click="emit('delete-requested')"
            class="btn bg-red-500 text-white hover:bg-red-600 flex items-center justify-center gap-2 order-2 sm:order-1"
            :disabled="isLoading"
          >
            <span class="material-symbols-outlined text-base">delete</span>
            Eliminar viaje
          </button>

          <!-- Botones de guardar/cancelar -->
          <div class="flex gap-3 order-1 sm:order-2">
            <button
              type="button"
              @click="cancelChanges"
              class="btn-outline"
              :disabled="isLoading"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn-primary flex items-center gap-2"
              :disabled="isLoading || !hasChanges"
            >
              <span v-if="isLoading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              <span v-else class="material-symbols-outlined text-base">save</span>
              {{ isLoading ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </div>
        </div>

        <!-- Mensaje de error general -->
        <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-700 text-sm flex items-center gap-2">
            <span class="material-symbols-outlined text-base">error</span>
            {{ error }}
          </p>
        </div>
      </form>
    </div>

    <!-- Sección de información (solo lectura) -->
    <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
      <h3 class="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
        <span class="material-symbols-outlined">info</span>
        Información del viaje
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="text-sm text-blue-700 font-medium mb-1">Creado por</p>
          <p class="text-blue-900">{{ tripData?.createdByName || 'No disponible' }}</p>
        </div>
        <div>
          <p class="text-sm text-blue-700 font-medium mb-1">Fecha de creación</p>
          <p class="text-blue-900">{{ formatCreationDate(tripData?.createdAt) }}</p>
        </div>
        <div>
          <p class="text-sm text-blue-700 font-medium mb-1">Total integrantes</p>
          <p class="text-blue-900">{{ tripData?.members?.length || 0 }} personas</p>
        </div>
        <div>
          <p class="text-sm text-blue-700 font-medium mb-1">Última actualización</p>
          <p class="text-blue-900">{{ formatCreationDate(tripData?.updatedAt) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useTrips } from '@/composables/useTrips'

const props = defineProps({
  tripData: Object,
  tripId: String
})

const emit = defineEmits(['saved', 'delete-requested', 'cancel'])

// Usar composable
const { 
  isLoading, 
  error, 
  updateTrip, 
  reset: resetComposable 
} = useTrips()

// Estado local
const form = reactive({
  name: '',
  destination: '',
  startDate: '',
  endDate: '',
  budget: 0
})

const errors = reactive({
  name: '',
  startDate: '',
  endDate: '',
  budget: ''
})

const originalData = ref({})

// Computed
const hasChanges = computed(() => {
  if (!originalData.value) return false
  
  return (
    form.name !== originalData.value.name ||
    form.destination !== originalData.value.destination ||
    form.startDate !== originalData.value.startDate ||
    form.endDate !== originalData.value.endDate ||
    Number(form.budget) !== Number(originalData.value.budget)
  )
})

// Inicializar formulario
const initForm = () => {
  if (props.tripData) {
    form.name = props.tripData.name || ''
    form.destination = props.tripData.destination || ''
    form.startDate = props.tripData.startDate || ''
    form.endDate = props.tripData.endDate || ''
    form.budget = props.tripData.budget || 0
    
    // Guardar datos originales para comparación
    originalData.value = { ...form }
  }
}

// Validar formulario
const validateForm = () => {
  let isValid = true
  
  // Resetear errores
  Object.keys(errors).forEach(key => errors[key] = '')
  
  // Validar nombre
  if (!form.name.trim()) {
    errors.name = 'El nombre del viaje es requerido'
    isValid = false
  }
  
  // Validar fechas
  if (!form.startDate) {
    errors.startDate = 'La fecha de inicio es requerida'
    isValid = false
  }
  
  if (!form.endDate) {
    errors.endDate = 'La fecha de fin es requerida'
    isValid = false
  }
  
  if (form.startDate && form.endDate) {
    const start = new Date(form.startDate)
    const end = new Date(form.endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (start > end) {
      errors.startDate = 'La fecha de inicio no puede ser posterior a la fecha de fin'
      isValid = false
    }
    
    if (start < today) {
      errors.startDate = 'La fecha de inicio no puede ser en el pasado'
      isValid = false
    }
  }
  
  // Validar presupuesto
  if (form.budget !== '' && form.budget !== null) {
    const budgetNum = Number(form.budget)
    if (isNaN(budgetNum) || budgetNum < 0) {
      errors.budget = 'El presupuesto debe ser un número válido mayor o igual a 0'
      isValid = false
    }
  }
  
  return isValid
}

// Guardar cambios
const saveChanges = async () => {
  if (!validateForm()) {
    return
  }

  const updates = {
    name: form.name.trim(),
    destination: form.destination.trim(),
    startDate: form.startDate,
    endDate: form.endDate,
    budget: Number(form.budget) || 0
  }

  const result = await updateTrip(props.tripId, updates)
  
  if (result.success) {
    emit('saved', '¡Cambios guardados exitosamente!')
    // Actualizar datos originales
    originalData.value = { ...form }
    resetComposable()
  } else {
    emit('saved', `Error: ${result.error}`)
  }
}

// Cancelar cambios
const cancelChanges = () => {
  if (hasChanges.value) {
    if (confirm('¿Deseas descartar los cambios no guardados?')) {
      resetForm()
      emit('cancel')
    }
  } else {
    emit('cancel')
  }
}

// Resetear formulario
const resetForm = () => {
  initForm()
  resetComposable()
}

// Formatear fecha de creación
const formatCreationDate = (timestamp) => {
  if (!timestamp) return 'No disponible'
  
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'Fecha no disponible'
  }
}

// Watch para validación en tiempo real
watch(() => form.startDate, () => {
  if (form.startDate && form.endDate) {
    const start = new Date(form.startDate)
    const end = new Date(form.endDate)
    if (start > end) {
      errors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio'
    } else {
      errors.endDate = ''
    }
  }
})

watch(() => form.endDate, () => {
  if (form.startDate && form.endDate) {
    const start = new Date(form.startDate)
    const end = new Date(form.endDate)
    if (start > end) {
      errors.startDate = 'La fecha de inicio debe ser anterior a la fecha de fin'
    } else {
      errors.startDate = ''
    }
  }
})

// Inicializar cuando cambien los datos
onMounted(() => {
  initForm()
})

watch(() => props.tripData, () => {
  initForm()
})
</script>

<style scoped>
/* Estilos específicos */
.btn {
  min-height: 42px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
}
</style>
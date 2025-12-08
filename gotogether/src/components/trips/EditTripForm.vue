<!-- components/trips/EditTripForm.vue -->
<template>
  <div>
    <!-- Formulario -->
    <div class="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <form @submit.prevent="saveChanges" class="space-y-6">
        <!-- Nombre -->
        <div>
          <label class="label">Nombre del viaje *</label>
          <input
            v-model="form.name"
            type="text"
            class="input"
            placeholder="Ej: Aventura en los Andes"
            required
            :disabled="saving"
          />
        </div>

        <!-- Destino -->
        <div>
          <label class="label">Destino específico</label>
          <input
            v-model="form.destination"
            type="text"
            class="input"
            placeholder="Ej: Salar de Uyuni"
            :disabled="saving"
          />
        </div>

        <!-- Fechas -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="label">Fecha inicio *</label>
            <input 
              v-model="form.startDate" 
              type="date" 
              class="input" 
              required 
              :disabled="saving"
            />
          </div>
          <div>
            <label class="label">Fecha fin *</label>
            <input 
              v-model="form.endDate" 
              type="date" 
              class="input" 
              required 
              :disabled="saving"
            />
          </div>
        </div>

        <!-- Mensaje de error -->
        <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-700 text-sm flex items-center gap-2">
            <span class="material-symbols-outlined text-base">error</span>
            {{ error }}
          </p>
        </div>

        <!-- Botones -->
        <div class="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-100">
          <button
            type="button"
            @click="$emit('delete-requested')"
            class="btn bg-red-500 text-white hover:bg-red-600 flex items-center justify-center gap-2 order-2 sm:order-1"
            :disabled="saving"
          >
            <span class="material-symbols-outlined text-base">delete</span>
            Eliminar viaje
          </button>

          <div class="flex gap-3 order-1 sm:order-2">
            <button
              type="button"
              @click="resetForm"
              class="btn-outline"
              :disabled="saving"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn-primary flex items-center gap-2"
              :disabled="saving || !hasChanges"
            >
              <span v-if="saving" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              <span v-else class="material-symbols-outlined text-base">save</span>
              {{ saving ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Info del viaje -->
    <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
      <h3 class="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
        <span class="material-symbols-outlined">info</span>
        Información del viaje
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p class="text-sm text-blue-700 font-medium mb-1">Creado por</p>
          <p class="text-blue-900">{{ tripData?.createdByName || 'No disponible' }}</p>
        </div>
        <div>
          <p class="text-sm text-blue-700 font-medium mb-1">Fecha de creación</p>
          <p class="text-blue-900">{{ formatDate(tripData?.createdAt) }}</p>
        </div>
        <div>
          <p class="text-sm text-blue-700 font-medium mb-1">Presupuesto base</p>
          <p class="text-blue-900 font-medium">Bs. {{ formatCurrency(tripData?.budget || 0) }}</p>
        </div>
        <div>
          <p class="text-sm text-blue-700 font-medium mb-1">Total integrantes</p>
          <p class="text-blue-900">{{ tripData?.members?.length || 0 }} personas</p>
        </div>
        <div>
          <p class="text-sm text-blue-700 font-medium mb-1">Última actualización</p>
          <p class="text-blue-900">{{ formatDate(tripData?.updatedAt) }}</p>
        </div>
        <div>
          <p class="text-sm text-blue-700 font-medium mb-1">ID del viaje</p>
          <p class="text-blue-900 font-mono text-sm">{{ tripId }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useTrips } from '@/composables/useTrips'

const props = defineProps({
  tripData: Object,
  tripId: String
})

const emit = defineEmits(['saved', 'delete-requested'])

const { updateTrip } = useTrips()

const saving = ref(false)
const error = ref('')
const form = reactive({
  name: '',
  destination: '',
  startDate: '',
  endDate: ''
  // Quitamos budget del formulario
})

// Inicializar formulario
const initForm = () => {
  if (props.tripData) {
    form.name = props.tripData.name || ''
    form.destination = props.tripData.destination || ''
    form.startDate = props.tripData.startDate || ''
    form.endDate = props.tripData.endDate || ''
    // No incluimos budget aquí
  }
}

// Verificar si hay cambios (sin budget)
const hasChanges = computed(() => {
  if (!props.tripData) return false
  return (
    form.name !== props.tripData.name ||
    form.destination !== props.tripData.destination ||
    form.startDate !== props.tripData.startDate ||
    form.endDate !== props.tripData.endDate
    // Quitamos la comparación de budget
  )
})

// Guardar cambios (sin budget)
const saveChanges = async () => {
  if (!hasChanges.value) {
    emit('saved', 'No hay cambios para guardar')
    return
  }

  saving.value = true
  error.value = ''

  try {
    // Validaciones
    if (!form.name.trim()) throw new Error('El nombre del viaje es requerido')
    if (!form.startDate || !form.endDate) throw new Error('Ambas fechas son requeridas')
    
    const startDate = new Date(form.startDate)
    const endDate = new Date(form.endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (startDate > endDate) {
      throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin')
    }
    
    if (startDate < today) {
      throw new Error('La fecha de inicio no puede ser en el pasado')
    }

    // Preparar actualización SIN budget
    const updates = {
      name: form.name.trim(),
      destination: form.destination.trim(),
      startDate: form.startDate,
      endDate: form.endDate
      // No incluimos budget aquí
    }

    // Guardar
    const result = await updateTrip(props.tripId, updates)
    
    if (result.success) {
      emit('saved', '¡Cambios guardados exitosamente!')
    } else {
      throw new Error(result.error)
    }
  } catch (err) {
    error.value = err.message
    console.error('Error guardando cambios:', err)
  } finally {
    saving.value = false
  }
}

// Resetear formulario
const resetForm = () => {
  initForm()
  error.value = ''
}

// Formatear fecha
const formatDate = (timestamp) => {
  if (!timestamp) return 'No disponible'
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return 'Fecha no disponible'
  }
}

// Formatear moneda
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0.00'
  return Number(amount).toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

onMounted(() => initForm())
</script>
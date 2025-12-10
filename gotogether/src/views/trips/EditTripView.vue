<!-- views/trips/EditTripView.vue -->
<template>
  <div class="container mx-auto p-4 max-w-4xl">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">Editar Viaje</h1>
      <div class="flex flex-wrap items-center gap-2 text-gray-600">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-base">explore</span>
          <span>{{ tripData?.name || 'Cargando...' }}</span>
        </div>
        <span class="text-gray-300">•</span>
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-base">calendar_today</span>
          <span>{{ formatDateRange(tripData?.startDate, tripData?.endDate) }}</span>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p class="mt-3 text-gray-600">Cargando datos del viaje...</p>
      </div>
    </div>

    <!-- Formulario -->
    <EditTripForm
      v-else
      :trip-data="tripData"
      :trip-id="tripId"
      @saved="handleSaveSuccess"
      @delete-requested="showDeleteModal = true"
    />

    <!-- Modal de eliminación -->
    <DeleteTripModal
      v-if="showDeleteModal"
      :trip-id="tripId"
      :trip-name="tripData?.name"
      @confirm="handleDeleteConfirmed"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTrips } from '@/composables/useTrips'
import EditTripForm from '@/components/trips/EditTripForm.vue'
import DeleteTripModal from '../../components/modals/DeleteTripModal.vue'

const router = useRouter()
const route = useRoute()
const tripId = route.params.id

const { fetchTrip, deleteTrip } = useTrips()

const loading = ref(true)
const tripData = ref(null)
const showDeleteModal = ref(false)

// Cargar datos
const loadTripData = async () => {
  const result = await fetchTrip(tripId)
  
  if (result.success) {
    tripData.value = result.trip
  } else {
    alert(`Error: ${result.error}`)
    router.push('/misviajes')
  }
  loading.value = false
}

// Manejar éxito al guardar - RECARGA LA PÁGINA
const handleSaveSuccess = async (message) => {
  // Mostrar mensaje de éxito
  alert(message)
  
  // Recargar datos del viaje
  await loadTripData()
  
  // Recargar también la página completa si quieres
  // window.location.reload()
}

// Manejar eliminación
const handleDeleteConfirmed = async () => {
  const result = await deleteTrip(tripId)
  
  if (result.success) {
    alert('Viaje eliminado exitosamente')
    router.push('/misviajes')
  } else {
    alert(`Error: ${result.error}`)
  }
  showDeleteModal.value = false
}

// Formatear fechas
const formatDateRange = (start, end) => {
  if (!start || !end) return 'Fechas no definidas'
  const format = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }
  return `${format(start)} - ${format(end)}`
}

onMounted(() => loadTripData())
</script>
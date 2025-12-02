<!-- views/trips/EditTripView.vue -->
<template>
  <div class="container mx-auto p-4 max-w-4xl">
    <!-- Header del viaje -->
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

    <!-- Contenido principal -->
    <div v-else>
      <!-- Componente del formulario -->
      <EditTripForm
        :trip-data="tripData"
        :trip-id="tripId"
        @saved="handleSaveSuccess"
        @delete-requested="showDeleteModal = true"
      />
    </div>

    <!-- Modal de confirmación de eliminación -->
    <DeleteTripModal
      v-if="showDeleteModal"
      :trip-name="tripData?.name"
      :trip-id="tripId"
      @confirm="handleDeleteConfirmed"
      @cancel="showDeleteModal = false"
    />

    <!-- Toast de notificación -->
    <ToastNotification
      v-if="toast.show"
      :type="toast.type"
      :message="toast.message"
      :details="toast.details"
      @close="toast.show = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { db } from '@/firebase/firebaseConfig'
import { doc, getDoc } from 'firebase/firestore'
import EditTripForm from '@/components/trips/EditTripForm.vue'
import DeleteTripModal from '@/components/trips/DeleteTripModal.vue'
import ToastNotification from '@/components/ui/ToastNotification.vue'

const router = useRouter()
const route = useRoute()
const tripId = route.params.id

// Estado
const loading = ref(true)
const tripData = ref(null)
const showDeleteModal = ref(false)
const toast = ref({
  show: false,
  type: 'success',
  message: '',
  details: ''
})

// Cargar datos del viaje
const loadTripData = async () => {
  try {
    loading.value = true
    const tripRef = doc(db, 'trips', tripId)
    const tripSnap = await getDoc(tripRef)
    
    if (tripSnap.exists()) {
      tripData.value = tripSnap.data()
    } else {
      showToast('error', 'Viaje no encontrado')
      router.push('/misviajes')
    }
  } catch (error) {
    console.error('Error cargando viaje:', error)
    showToast('error', 'Error al cargar el viaje', error.message)
  } finally {
    loading.value = false
  }
}

// Manejar éxito de guardado
const handleSaveSuccess = (message) => {
  showToast('success', message)
  loadTripData() // Recargar datos actualizados
}

// Manejar confirmación de eliminación
const handleDeleteConfirmed = () => {
  showDeleteModal.value = false
  showToast('success', 'Viaje eliminado correctamente')
  
  // Redirigir después de un momento
  setTimeout(() => {
    router.push('/misviajes')
  }, 1500)
}

// Formatear fecha
const formatDateRange = (start, end) => {
  if (!start || !end) return 'Fechas no definidas'
  
  const format = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }
  
  return `${format(start)} - ${format(end)}`
}

// Mostrar toast
const showToast = (type, message, details = '') => {
  toast.value = { show: true, type, message, details }
  setTimeout(() => {
    toast.value.show = false
  }, 5000)
}

// Cargar datos al montar
onMounted(() => {
  loadTripData()
})
</script>
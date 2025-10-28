<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="closeModal"
      >
        <div 
          class="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-xl font-bold text-neutral-900 dark:text-white">
              Agregar Punto de Interés
            </h3>
            <button 
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              @click="closeModal"
              aria-label="Cerrar"
            >
              <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg" class="text-gray-600 dark:text-gray-400">
                <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
            <!-- Mensaje de ubicación desde click (si aplica) -->
            <div v-if="initialData" class="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                <path d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z"></path>
              </svg>
              <div class="flex-1">
                <p class="text-sm font-medium text-blue-900 dark:text-blue-200">
                  Ubicación seleccionada del mapa
                </p>
                <p class="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Coordenadas: {{ initialData.coordinates?.lat.toFixed(6) }}, {{ initialData.coordinates?.lng.toFixed(6) }}
                </p>
              </div>
            </div>

            <!-- Buscador con Geocoding -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Buscar ubicación
              </label>
              <MapboxGeocoder
                ref="geocoderRef"
                placeholder="Busca un lugar, dirección o punto de interés..."
                @result="handleGeocoderResult"
                @clear="handleGeocoderClear"
              />
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Busca y selecciona un lugar para autocompletar los datos
              </p>
            </div>

            <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                O ingresa los datos manualmente:
              </p>
            </div>

            <!-- Nombre -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del lugar *
              </label>
              <input 
                v-model="formData.name"
                type="text"
                required
                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Ej: Mirador Killi Killi"
              />
            </div>

            <!-- Ubicación -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ubicación *
              </label>
              <input 
                v-model="formData.location"
                type="text"
                required
                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Ej: La Paz, Bolivia"
              />
            </div>

            <!-- Coordenadas -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Latitud *
                </label>
                <input 
                  v-model.number="formData.coordinates.lat"
                  type="number"
                  step="any"
                  required
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="-16.5"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Longitud *
                </label>
                <input 
                  v-model.number="formData.coordinates.lng"
                  type="number"
                  step="any"
                  required
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="-68.15"
                />
              </div>
            </div>

            <!-- Categoría -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoría
              </label>
              <select 
                v-model="formData.category"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="general">General</option>
                <option value="restaurante">Restaurante</option>
                <option value="hotel">Hotel</option>
                <option value="atraccion">Atracción Turística</option>
                <option value="transporte">Transporte</option>
                <option value="compras">Compras</option>
                <option value="naturaleza">Naturaleza</option>
                <option value="cultura">Cultura</option>
              </select>
            </div>

            <!-- Descripción -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción (opcional)
              </label>
              <textarea 
                v-model="formData.description"
                rows="3"
                class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                placeholder="Agrega una descripción del lugar..."
              ></textarea>
            </div>

            <!-- Botón para obtener ubicación actual -->
            <button
              type="button"
              @click="getCurrentLocation"
              :disabled="loadingLocation"
              class="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-[#1313ec] text-[#1313ec] hover:bg-[#1313ec]/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg 
                v-if="!loadingLocation"
                fill="currentColor" 
                height="20" 
                viewBox="0 0 256 256" 
                width="20" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z"></path>
              </svg>
              <span>{{ loadingLocation ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual' }}</span>
            </button>

            <!-- Botones de acción -->
            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="flex-1 px-4 py-3 rounded-lg bg-[#1313ec] text-white font-bold hover:bg-[#1313ec]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ loading ? 'Guardando...' : 'Guardar Punto' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import MapboxGeocoder from './MapboxGeocoder.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  initialData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'submit'])

const loading = ref(false)
const loadingLocation = ref(false)
const geocoderRef = ref(null)

const formData = ref({
  name: '',
  location: '',
  coordinates: {
    lat: 0,
    lng: 0
  },
  category: 'general',
  description: ''
})

// Resetear formulario cuando se abre el modal
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    // Si hay datos iniciales (click en el mapa), usarlos
    if (props.initialData) {
      formData.value = {
        name: props.initialData.name || '',
        location: props.initialData.location || 'Cargando ubicación...',
        coordinates: {
          lat: props.initialData.coordinates?.lat || 0,
          lng: props.initialData.coordinates?.lng || 0
        },
        category: 'general',
        description: ''
      }
    } else {
      // Resetear a valores por defecto
      formData.value = {
        name: '',
        location: '',
        coordinates: {
          lat: 0,
          lng: 0
        },
        category: 'general',
        description: ''
      }
    }
    
    // Limpiar el geocoder
    if (geocoderRef.value) {
      geocoderRef.value.clear()
    }
  }
})

// Watch para actualizar la ubicación cuando cambian los initialData
watch(() => props.initialData, (newData) => {
  if (newData && props.isOpen) {
    if (newData.location && newData.location !== 'Cargando ubicación...') {
      formData.value.location = newData.location
      if (newData.name) {
        formData.value.name = newData.name
      }
    }
  }
}, { deep: true })

const closeModal = () => {
  emit('close')
}

const handleGeocoderResult = (result) => {
  console.log('Resultado del geocoder:', result)
  
  // Autocompletar los campos con el resultado
  formData.value.name = result.name.split(',')[0] || result.name
  formData.value.location = result.location
  formData.value.coordinates.lat = result.coordinates.lat
  formData.value.coordinates.lng = result.coordinates.lng
  
  // Intentar determinar la categoría basada en el tipo de lugar
  const placeType = result.type
  if (placeType === 'poi') {
    // Analizar propiedades para determinar categoría
    const category = result.properties?.category
    if (category) {
      if (category.includes('restaurant') || category.includes('food')) {
        formData.value.category = 'restaurante'
      } else if (category.includes('hotel') || category.includes('lodging')) {
        formData.value.category = 'hotel'
      } else if (category.includes('shop') || category.includes('store')) {
        formData.value.category = 'compras'
      } else if (category.includes('park') || category.includes('nature')) {
        formData.value.category = 'naturaleza'
      } else if (category.includes('museum') || category.includes('theater') || category.includes('art')) {
        formData.value.category = 'cultura'
      }
    }
  }
}

const handleGeocoderClear = () => {
  console.log('Geocoder limpiado')
}

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert('Tu navegador no soporta geolocalización')
    return
  }

  loadingLocation.value = true

  navigator.geolocation.getCurrentPosition(
    (position) => {
      formData.value.coordinates.lat = position.coords.latitude
      formData.value.coordinates.lng = position.coords.longitude
      loadingLocation.value = false
    },
    (error) => {
      console.error('Error getting location:', error)
      alert('No se pudo obtener tu ubicación. Por favor, ingresa las coordenadas manualmente.')
      loadingLocation.value = false
    }
  )
}

const handleSubmit = async () => {
  loading.value = true
  try {
    await emit('submit', { ...formData.value })
    closeModal()
  } catch (error) {
    console.error('Error submitting form:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
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
  transform: scale(0.9);
}
</style>

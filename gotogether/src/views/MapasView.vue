<template>
  <div class="mapas-view">
  <main class="flex-1 flex flex-col lg:flex-row gap-6 p-4 sm:p-6 bg-transparent min-h-[calc(100vh-6rem)]">
      <!-- Sección principal del mapa -->
      <div class="flex-1 flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
            Mapa de Puntos de Interés
          </h2>
        </div>
        
        <div class="flex-1 flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg border border-gray-200/70 dark:border-gray-700/70">
          <!-- Loading spinner -->
          <div v-if="loading" class="flex-1 flex items-center justify-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1313ec]"></div>
          </div>

          <!-- Google Maps -->
          <div v-else class="relative flex-1 min-h-[65vh] sm:min-h-[540px] lg:min-h-[720px]">
            <MapboxMap 
              ref="mapRef"
              :points="points"
              :selected-point="selectedPoint"
              @marker-click="handleMarkerClick"
              @map-click="handleMapClick"
              @map-ready="handleMapReady"
              class="absolute inset-0"
            />
            
            <!-- Buscador superpuesto -->
            <!-- Buscador superpuesto con Geocoding -->
            <div class="absolute top-4 left-4 right-4 sm:max-w-md z-10">
              <MapboxGeocoder
                ref="searchGeocoderRef"
                placeholder="Buscar ubicación en el mapa..."
                @result="handleSearchResult"
                @clear="handleSearchClear"
              />
            </div>            <!-- Controles de zoom y ubicación superpuestos -->
            <div class="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
              <div class="flex flex-col rounded-lg overflow-hidden bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-lg border border-gray-300 dark:border-gray-600">
                <button 
                  class="p-2.5 text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  @click="handleZoomIn"
                  aria-label="Acercar"
                >
                  <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
                  </svg>
                </button>
                <hr class="border-gray-300 dark:border-gray-600"/>
                <button 
                  class="p-2.5 text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  @click="handleZoomOut"
                  aria-label="Alejar"
                >
                  <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z"></path>
                  </svg>
                </button>
              </div>
              <button 
                class="p-2.5 rounded-lg bg-white/95 dark:bg-gray-800/95 shadow-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                @click="handleCenterToUser"
                aria-label="Mi ubicación"
              >
                <svg fill="currentColor" height="20" transform="scale(-1, 1)" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M229.33,98.21,53.41,33l-.16-.05A16,16,0,0,0,32.9,53.25a1,1,0,0,0,.05.16L98.21,229.33A15.77,15.77,0,0,0,113.28,240h.3a15.77,15.77,0,0,0,15-11.29l23.56-76.56,76.56-23.56a16,16,0,0,0,.62-30.38ZM224,113.3l-76.56,23.56a16,16,0,0,0-10.58,10.58L113.3,224h0l-.06-.17L48,48l175.82,65.22.16.06Z"></path>
                </svg>
              </button>
            </div>

            <!-- Botón agregar punto superpuesto -->
            <div class="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
              <button 
                class="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1313ec] text-white font-semibold text-sm shadow-xl hover:bg-[#1313ec]/90 transition-colors"
                @click="openAddPointModal"
              >
                <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
                </svg>
                <span>Agregar punto</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Sidebar de puntos guardados -->
      <aside class="w-full lg:w-96 flex-shrink-0 flex flex-col gap-4">
        <h3 class="text-2xl font-bold text-neutral-900 dark:text-white">
          Puntos Guardados
        </h3>
        
        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1313ec]"></div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="text-center py-8 text-red-600 dark:text-red-400">
          <p>{{ error }}</p>
        </div>

        <!-- Lista de puntos -->
        <div v-else class="flex flex-col gap-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
          <div 
            v-for="point in filteredPoints" 
            :key="point.id"
            class="flex items-center gap-4 p-3 rounded-lg bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer group"
            @click="selectPoint(point)"
          >
            <div class="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-[#1313ec]">
              <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z"></path>
              </svg>
            </div>
            <div class="flex-1 overflow-hidden">
              <div class="flex items-center justify-between">
                <p class="font-bold text-neutral-900 dark:text-white truncate">
                  {{ point.name }}
                </p>
                <button 
                  @click.stop="deletePoint(point.id)"
                  class="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-opacity"
                  aria-label="Eliminar punto"
                >
                  <svg fill="currentColor" height="18" viewBox="0 0 256 256" width="18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
                  </svg>
                </button>
              </div>
              <p class="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                {{ point.location }}
              </p>
              <p v-if="point.category !== 'general'" class="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {{ getCategoryLabel(point.category) }}
              </p>
            </div>
          </div>
          
          <!-- Mensaje si no hay puntos -->
          <div 
            v-if="points.length === 0"
            class="text-center py-8 text-neutral-500 dark:text-neutral-400"
          >
            <p>No tienes puntos guardados</p>
            <p class="text-sm mt-2">Agrega tu primer punto de interés</p>
          </div>

          <!-- Mensaje si la búsqueda no tiene resultados -->
          <div 
            v-else-if="filteredPoints.length === 0"
            class="text-center py-8 text-neutral-500 dark:text-neutral-400"
          >
            <p>No se encontraron puntos</p>
            <p class="text-sm mt-2">Intenta con otra búsqueda</p>
          </div>
        </div>
      </aside>
    </main>

    <!-- Modal para agregar punto -->
    <AddPointModal 
      :is-open="isModalOpen"
      :initial-data="clickedLocation"
      @close="closeModal"
      @submit="handleAddPoint"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMap } from '../composables/useMap'
import { useGeocoding } from '../composables/useGeocoding'
import MapboxMap from '../components/mapas/MapboxMap.vue'
import AddPointModal from '../components/mapas/AddPointModal.vue'
import MapboxGeocoder from '../components/mapas/MapboxGeocoder.vue'

// Composable para manejo de datos
const { points, loading, error, agregarPunto, eliminarPunto } = useMap()
const { reverseGeocode } = useGeocoding()

// Estado local
const searchQuery = ref('')
const selectedPoint = ref(null)
const isModalOpen = ref(false)
const mapRef = ref(null)
const searchGeocoderRef = ref(null)
const clickedLocation = ref(null)

// Filtrar puntos según búsqueda
const filteredPoints = computed(() => {
  if (!searchQuery.value.trim()) {
    return points.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return points.value.filter(point => 
    point.name.toLowerCase().includes(query) ||
    point.location.toLowerCase().includes(query) ||
    (point.category && point.category.toLowerCase().includes(query)) ||
    (point.description && point.description.toLowerCase().includes(query))
  )
})

// Métodos de búsqueda con geocoder
const handleSearchResult = (result) => {
  console.log('Resultado de búsqueda:', result)
  
  // Centrar el mapa en el resultado
  if (mapRef.value && result.coordinates) {
    mapRef.value.panTo(result.coordinates)
  }
}

const handleSearchClear = () => {
  console.log('Búsqueda limpiada')
}

const handleZoomIn = () => {
  if (mapRef.value) {
    mapRef.value.zoomIn()
  }
}

const handleZoomOut = () => {
  if (mapRef.value) {
    mapRef.value.zoomOut()
  }
}

const handleCenterToUser = () => {
  if (mapRef.value) {
    mapRef.value.centerToUserLocation()
  }
}

const handleMapClick = async (coordinates) => {
  console.log('Click en mapa:', coordinates)
  
  // Guardar las coordenadas clickeadas
  clickedLocation.value = {
    coordinates: coordinates,
    name: '',
    location: 'Cargando ubicación...'
  }
  
  // Abrir el modal inmediatamente
  isModalOpen.value = true
  
  // Hacer reverse geocoding para obtener la dirección
  try {
    const result = await reverseGeocode(coordinates, {
      types: 'address,place,locality',
      limit: 1
    })
    
    if (result && clickedLocation.value) {
      clickedLocation.value.location = result.location
      clickedLocation.value.name = result.name.split(',')[0] || result.name
    }
  } catch (err) {
    console.error('Error en reverse geocoding:', err)
    if (clickedLocation.value) {
      clickedLocation.value.location = `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`
    }
  }
}

const handleMarkerClick = (point) => {
  console.log('Click en marcador:', point)
  selectedPoint.value = point
}

const handleMapReady = (map) => {
  console.log('Mapa listo:', map)
}

const openAddPointModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  clickedLocation.value = null
  
  // Limpiar marcador temporal del mapa
  if (mapRef.value) {
    mapRef.value.clearTempMarker()
  }
}

const handleAddPoint = async (pointData) => {
  try {
    await agregarPunto(pointData)
    console.log('Punto agregado exitosamente')
    
    // Limpiar marcador temporal del mapa
    if (mapRef.value) {
      mapRef.value.clearTempMarker()
    }
  } catch (error) {
    console.error('Error al agregar punto:', error)
    alert('Error al guardar el punto de interés. Por favor, intenta de nuevo.')
  }
}

const deletePoint = async (pointId) => {
  if (confirm('¿Estás seguro de que deseas eliminar este punto de interés?')) {
    try {
      await eliminarPunto(pointId)
      console.log('Punto eliminado exitosamente')
    } catch (error) {
      console.error('Error al eliminar punto:', error)
      alert('Error al eliminar el punto. Por favor, intenta de nuevo.')
    }
  }
}

const selectPoint = (point) => {
  selectedPoint.value = point
  if (mapRef.value) {
    mapRef.value.panTo(point.coordinates)
  }
}

const getCategoryLabel = (category) => {
  const labels = {
    restaurante: 'Restaurante',
    hotel: 'Hotel',
    atraccion: 'Atracción',
    transporte: 'Transporte',
    compras: 'Compras',
    naturaleza: 'Naturaleza',
    cultura: 'Cultura',
    general: 'General'
  }
  return labels[category] || category
}
</script>

<style scoped>
.mapas-view {
  min-height: calc(100vh - 4.5rem);
  background: transparent;
  display: flex;
  flex-direction: column;
}

/* Scrollbar personalizado para la lista de puntos */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Responsive */
@media (max-width: 1023px) {
  .mapas-view {
    min-height: calc(100vh - 3.5rem);
  }
}
</style>

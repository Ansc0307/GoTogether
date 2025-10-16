<template>
  <div class="mapas-view">
    <main class="flex-1 flex flex-col lg:flex-row gap-6 p-4 sm:p-6 bg-transparent">
      <!-- Sección principal del mapa -->
      <div class="flex-1 flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
            Mapa de Puntos de Interés
          </h2>
        </div>
        
        <div class="flex-1 flex flex-col rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700">
          <!-- Mapa -->
          <div class="relative flex-1 bg-cover bg-center map-container" :style="mapBackgroundStyle">
            <!-- Buscador -->
            <div class="absolute top-4 left-4 right-4 sm:max-w-xs">
              <label class="relative">
                <div class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                  <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                  </svg>
                </div>
                <input 
                  v-model="searchQuery"
                  class="w-full h-12 pl-10 pr-4 rounded-lg bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                  placeholder="Buscar lugares"
                  @input="onSearchInput"
                />
              </label>
            </div>
            
            <!-- Controles de zoom y ubicación -->
            <div class="absolute bottom-4 right-4 flex flex-col gap-2">
              <div class="flex flex-col rounded-lg overflow-hidden bg-white/90 dark:bg-gray-800/90 shadow-lg border border-gray-300 dark:border-gray-600">
                <button 
                  class="p-2.5 text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  @click="zoomIn"
                  aria-label="Acercar"
                >
                  <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
                  </svg>
                </button>
                <hr class="border-gray-300 dark:border-gray-600"/>
                <button 
                  class="p-2.5 text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  @click="zoomOut"
                  aria-label="Alejar"
                >
                  <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z"></path>
                  </svg>
                </button>
              </div>
              <button 
                class="p-2.5 rounded-lg bg-white/90 dark:bg-gray-800/90 shadow-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                @click="centerToUserLocation"
                aria-label="Mi ubicación"
              >
                <svg fill="currentColor" height="20" transform="scale(-1, 1)" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M229.33,98.21,53.41,33l-.16-.05A16,16,0,0,0,32.9,53.25a1,1,0,0,0,.05.16L98.21,229.33A15.77,15.77,0,0,0,113.28,240h.3a15.77,15.77,0,0,0,15-11.29l23.56-76.56,76.56-23.56a16,16,0,0,0,.62-30.38ZM224,113.3l-76.56,23.56a16,16,0,0,0-10.58,10.58L113.3,224h0l-.06-.17L48,48l175.82,65.22.16.06Z"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Botón agregar punto -->
          <div class="p-4 flex justify-end">
            <button 
              class="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#1313ec] text-white font-bold text-sm shadow-lg hover:bg-[#1313ec]/90 transition-colors"
              @click="openAddPointModal"
            >
              <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
              </svg>
              <span>Agregar Punto de Interés</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Sidebar de puntos guardados -->
      <aside class="w-full lg:w-96 flex-shrink-0 flex flex-col gap-4">
        <h3 class="text-2xl font-bold text-neutral-900 dark:text-white">
          Puntos Guardados
        </h3>
        
        <div class="flex flex-col gap-2 max-h-[calc(100vh-12rem)] overflow-y-auto">
          <div 
            v-for="point in savedPoints" 
            :key="point.id"
            class="flex items-center gap-4 p-3 rounded-lg bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer"
            @click="selectPoint(point)"
          >
            <div class="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-[#1313ec]">
              <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z"></path>
              </svg>
            </div>
            <div class="flex-1 overflow-hidden">
              <p class="font-bold text-neutral-900 dark:text-white truncate">
                {{ point.name }}
              </p>
              <p class="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                Ubicación: {{ point.location }}
              </p>
            </div>
          </div>
          
          <!-- Mensaje si no hay puntos -->
          <div 
            v-if="savedPoints.length === 0"
            class="text-center py-8 text-neutral-500 dark:text-neutral-400"
          >
            <p>No tienes puntos guardados</p>
            <p class="text-sm mt-2">Agrega tu primer punto de interés</p>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Estado
const searchQuery = ref('')
const selectedPoint = ref(null)

// Datos de ejemplo (más adelante vendrán de Firebase)
const savedPoints = ref([
  {
    id: 1,
    name: 'Mirador Killi Killi',
    location: 'La Paz',
    coordinates: { lat: -16.5, lng: -68.15 }
  },
  {
    id: 2,
    name: 'Isla Incahuasi',
    location: 'Salar de Uyuni',
    coordinates: { lat: -20.3, lng: -66.7 }
  },
  {
    id: 3,
    name: 'Isla del Sol',
    location: 'Lago Titicaca',
    coordinates: { lat: -16.03, lng: -69.17 }
  },
  {
    id: 4,
    name: 'Rurrenabaque',
    location: 'Parque Nacional Madidi',
    coordinates: { lat: -14.44, lng: -67.53 }
  }
])

// Estilo del mapa (imagen de fondo temporal)
const mapBackgroundStyle = computed(() => ({
  backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDxi93lqkiowjL_ow1kdUbacisKZkT47fimWIBHwNHk74usPUWSs3sEAxtWDdGFOOxou1sqDXsHm8kVQpx0LD5RPzGiBT--vT0qYD8fLfvngkV4v45AQQSrbbJWeYEmnOsq3Lxx2lCRrbt_1Qo5vWP_syL5DZdFDTL7Kes-wCbD88ucSdzDog8oCsKO-B-OiHLKzE6drwDGXpoQfHP9jiamXgjn5xwu9EASRXxdgQjfonioNrEaR17gPIn9boWl455ynEQEbq-1oic")'
}))

// Métodos
const onSearchInput = () => {
  console.log('Buscando:', searchQuery.value)
  // Aquí iría la lógica de búsqueda
}

const zoomIn = () => {
  console.log('Zoom in')
  // Aquí iría la lógica de zoom
}

const zoomOut = () => {
  console.log('Zoom out')
  // Aquí iría la lógica de zoom
}

const centerToUserLocation = () => {
  console.log('Centrar en ubicación del usuario')
  // Aquí iría la lógica para obtener y centrar en la ubicación del usuario
}

const openAddPointModal = () => {
  console.log('Abrir modal para agregar punto')
  // Aquí iría la lógica para abrir un modal/formulario
}

const selectPoint = (point) => {
  selectedPoint.value = point
  console.log('Punto seleccionado:', point)
  // Aquí iría la lógica para centrar el mapa en este punto
}
</script>

<style scoped>
.mapas-view {
  min-height: calc(100vh - 4.5rem);
  background: transparent;
}

.map-container {
  min-height: 500px;
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
  .map-container {
    min-height: 400px;
  }
}
</style>

<template>
  <!-- Mostrar guía si no hay Access Token configurado -->
  <div v-if="!hasValidAccessToken" class="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="text-center p-8 max-w-md">
      <svg class="w-16 h-16 mx-auto mb-4 text-yellow-500" fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
        <path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z"></path>
      </svg>
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Access Token no configurado
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        Configura tu Mapbox Access Token en el archivo <code class="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">.env</code>
      </p>
      <p class="text-sm text-gray-500 dark:text-gray-500 mb-4">
        Revisa <code class="bg-gray-200 dark:bg-gray-700 px-1 rounded">MAPBOX_SETUP.md</code> para instrucciones
      </p>
      <a 
        href="https://account.mapbox.com/access-tokens/" 
        target="_blank"
        class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
      >
        Obtener Access Token Gratis
      </a>
    </div>
  </div>
  
  <!-- Mapa de Mapbox -->
  <div v-else ref="mapContainer" class="w-full h-full"></div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MAPBOX_CONFIG, DEFAULT_CENTER, DEFAULT_ZOOM } from '../../config/mapbox'

const props = defineProps({
  points: {
    type: Array,
    default: () => []
  },
  selectedPoint: {
    type: Object,
    default: null
  },
  center: {
    type: Object,
    default: () => DEFAULT_CENTER
  },
  zoom: {
    type: Number,
    default: DEFAULT_ZOOM
  }
})

const emit = defineEmits(['map-click', 'marker-click', 'map-ready'])

const mapContainer = ref(null)
let map = null
let markers = []
let tempMarker = null // Marcador temporal para clicks en el mapa

// Verificar si hay un Access Token válido
const hasValidAccessToken = MAPBOX_CONFIG.accessToken && 
                           MAPBOX_CONFIG.accessToken !== 'TU_ACCESS_TOKEN_AQUI' &&
                           MAPBOX_CONFIG.accessToken.length > 20

// Configurar Mapbox
mapboxgl.accessToken = MAPBOX_CONFIG.accessToken

// Colores de marcadores por categoría
const markerColors = {
  restaurante: '#FF6B6B',
  hotel: '#4ECDC4',
  atraccion: '#45B7D1',
  transporte: '#FFA07A',
  compras: '#98D8C8',
  naturaleza: '#6BCF7F',
  cultura: '#C780FA',
  general: '#1313ec'
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

const initMap = () => {
  if (!hasValidAccessToken || !mapContainer.value) {
    console.warn('Mapbox Access Token no está configurado correctamente')
    return
  }
  
  try {
    // Crear el mapa
    map = new mapboxgl.Map({
      container: mapContainer.value,
      style: MAPBOX_CONFIG.style,
      center: [props.center.lng, props.center.lat],
      zoom: props.zoom,
      language: MAPBOX_CONFIG.language
    })
    
    // Evento cuando el mapa está listo
    map.on('load', () => {
      emit('map-ready', map)
      updateMarkers()
    })
    
    // Evento de click en el mapa
    map.on('click', (e) => {
      // Eliminar marcador temporal anterior si existe
      if (tempMarker) {
        tempMarker.remove()
      }
      
      // Crear marcador temporal en la posición del click
      const el = document.createElement('div')
      el.className = 'temp-marker'
      el.style.width = '30px'
      el.style.height = '40px'
      el.style.cursor = 'pointer'
      
      el.innerHTML = `
        <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#shadow-temp)">
            <path d="M15 0C9.477 0 5 4.477 5 10c0 7.5 10 20 10 20s10-12.5 10-20c0-5.523-4.477-10-10-10z" 
                  fill="#ff6b6b" 
                  stroke="#FFFFFF" 
                  stroke-width="2"/>
            <circle cx="15" cy="10" r="4" fill="#FFFFFF" opacity="0.9"/>
          </g>
          <defs>
            <filter id="shadow-temp" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
            </filter>
          </defs>
        </svg>
      `
      
      tempMarker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
      })
        .setLngLat([e.lngLat.lng, e.lngLat.lat])
        .addTo(map)
      
      // Emitir evento con las coordenadas
      emit('map-click', {
        lng: e.lngLat.lng,
        lat: e.lngLat.lat
      })
    })
    
  } catch (error) {
    console.error('Error loading Mapbox:', error)
  }
}

const createMarkerElement = (point) => {
  const el = document.createElement('div')
  el.className = 'custom-marker'
  el.style.width = '30px'
  el.style.height = '40px'
  el.style.cursor = 'pointer'
  
  const color = markerColors[point.category] || markerColors.general
  
  el.innerHTML = `
    <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#shadow)">
        <path d="M15 0C9.477 0 5 4.477 5 10c0 7.5 10 20 10 20s10-12.5 10-20c0-5.523-4.477-10-10-10z" 
              fill="${color}" 
              stroke="#FFFFFF" 
              stroke-width="2"/>
        <circle cx="15" cy="10" r="4" fill="#FFFFFF" opacity="0.9"/>
      </g>
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
    </svg>
  `
  
  return el
}

const updateMarkers = () => {
  if (!map) return
  
  // Limpiar marcadores existentes
  markers.forEach(marker => marker.remove())
  markers = []
  
  // Crear nuevos marcadores
  props.points.forEach(point => {
    const el = createMarkerElement(point)
    
    // Crear popup
    const popupContent = `
      <div style="padding: 10px; max-width: 250px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1a1a1a;">
          ${point.name}
        </h3>
        <p style="margin: 4px 0; font-size: 14px; color: #666;">
          <strong>Ubicación:</strong> ${point.location}
        </p>
        ${point.description ? `
          <p style="margin: 4px 0; font-size: 14px; color: #666;">
            <strong>Descripción:</strong> ${point.description}
          </p>
        ` : ''}
        ${point.category !== 'general' ? `
          <p style="margin: 4px 0; font-size: 12px; color: #1313ec;">
            <strong>Categoría:</strong> ${getCategoryLabel(point.category)}
          </p>
        ` : ''}
      </div>
    `
    
    const popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML(popupContent)
    
    // Crear marcador
    const marker = new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat([point.coordinates.lng, point.coordinates.lat])
      .setPopup(popup)
      .addTo(map)
    
    // Evento de click en el marcador
    el.addEventListener('click', () => {
      emit('marker-click', point)
    })
    
    markers.push(marker)
  })
}

// Método público para eliminar el marcador temporal
const clearTempMarker = () => {
  if (tempMarker) {
    tempMarker.remove()
    tempMarker = null
  }
}

// Método público para centrar el mapa en una ubicación
const panTo = (location) => {
  if (map) {
    map.flyTo({
      center: [location.lng, location.lat],
      zoom: 15,
      duration: 1500
    })
  }
}

// Método público para hacer zoom in
const zoomIn = () => {
  if (map) {
    map.zoomIn({ duration: 300 })
  }
}

// Método público para hacer zoom out
const zoomOut = () => {
  if (map) {
    map.zoomOut({ duration: 300 })
  }
}

// Método público para centrar en la ubicación del usuario
const centerToUserLocation = () => {
  if (!navigator.geolocation) {
    alert('Tu navegador no soporta geolocalización')
    return
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const pos = {
        lng: position.coords.longitude,
        lat: position.coords.latitude
      }
      
      if (map) {
        map.flyTo({
          center: [pos.lng, pos.lat],
          zoom: 15,
          duration: 1500
        })
        
        // Agregar un marcador temporal en la ubicación del usuario
        const el = document.createElement('div')
        el.className = 'user-location-marker'
        el.style.width = '20px'
        el.style.height = '20px'
        el.style.borderRadius = '50%'
        el.style.backgroundColor = '#4285F4'
        el.style.border = '3px solid #FFFFFF'
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
        
        new mapboxgl.Marker({
          element: el
        })
          .setLngLat([pos.lng, pos.lat])
          .addTo(map)
      }
    },
    (error) => {
      console.error('Error getting location:', error)
      alert('No se pudo obtener tu ubicación')
    }
  )
}

// Watch para actualizar marcadores cuando cambian los puntos
watch(() => props.points, () => {
  if (map && map.loaded()) {
    updateMarkers()
  }
}, { deep: true })

// Watch para centrar el mapa cuando se selecciona un punto
watch(() => props.selectedPoint, (newPoint) => {
  if (newPoint && newPoint.coordinates) {
    panTo(newPoint.coordinates)
  }
})

// Exponer métodos para el componente padre
defineExpose({
  panTo,
  zoomIn,
  zoomOut,
  centerToUserLocation,
  clearTempMarker
})

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  // Limpiar marcadores
  markers.forEach(marker => marker.remove())
  
  // Limpiar marcador temporal
  if (tempMarker) {
    tempMarker.remove()
  }
  
  // Destruir el mapa
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
:deep(.mapboxgl-popup-content) {
  padding: 0;
  border-radius: 8px;
}

:deep(.mapboxgl-popup-close-button) {
  font-size: 20px;
  padding: 8px;
  color: #666;
}

:deep(.mapboxgl-popup-close-button):hover {
  background-color: #f0f0f0;
  color: #333;
}
</style>

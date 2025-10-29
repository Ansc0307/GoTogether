<template>
  <div class="mapbox-geocoder-wrapper">
    <div ref="geocoderContainer" class="geocoder-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import { MAPBOX_CONFIG } from '../../config/mapbox'

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Buscar ubicación...'
  },
  proximity: {
    type: Object,
    default: null
  },
  bbox: {
    type: Array,
    default: null
  },
  countries: {
    type: String,
    default: ''
  },
  types: {
    type: String,
    default: 'country,region,postcode,district,place,locality,neighborhood,address,poi'
  },
  limit: {
    type: Number,
    default: 5
  },
  language: {
    type: String,
    default: 'es'
  }
})

const emit = defineEmits(['result', 'results', 'clear', 'loading', 'error'])

const geocoderContainer = ref(null)
let geocoder = null

onMounted(() => {
  if (!MAPBOX_CONFIG.accessToken || MAPBOX_CONFIG.accessToken === 'TU_ACCESS_TOKEN_AQUI') {
    console.error('Mapbox Access Token no configurado')
    return
  }

  // Configurar el geocoder
  geocoder = new MapboxGeocoder({
    accessToken: MAPBOX_CONFIG.accessToken,
    placeholder: props.placeholder,
    proximity: props.proximity,
    bbox: props.bbox,
    countries: props.countries,
    types: props.types,
    limit: props.limit,
    language: props.language,
    marker: false, // No agregar marcador automático
    mapboxgl: null // No vincular a un mapa específico
  })

  // Eventos del geocoder
  geocoder.on('result', (e) => {
    const result = e.result
    emit('result', {
      name: result.place_name,
      location: result.place_name,
      coordinates: {
        lng: result.center[0],
        lat: result.center[1]
      },
      type: result.place_type?.[0] || 'place',
      properties: result.properties || {},
      bbox: result.bbox,
      context: result.context || []
    })
  })

  geocoder.on('results', (e) => {
    emit('results', e.features)
  })

  geocoder.on('clear', () => {
    emit('clear')
  })

  geocoder.on('loading', (e) => {
    emit('loading', e)
  })

  geocoder.on('error', (e) => {
    emit('error', e.error)
  })

  // Agregar el geocoder al contenedor
  if (geocoderContainer.value) {
    geocoderContainer.value.appendChild(geocoder.onAdd())
  }
})

// Método público para obtener el resultado actual
const getResult = () => {
  return geocoder ? geocoder.query : null
}

// Método público para establecer una búsqueda
const setInput = (query) => {
  if (geocoder) {
    geocoder.setInput(query)
  }
}

// Método público para limpiar la búsqueda
const clear = () => {
  if (geocoder) {
    geocoder.clear()
  }
}

// Método público para realizar búsqueda programática
const query = (searchText) => {
  if (geocoder) {
    geocoder.query(searchText)
  }
}

defineExpose({
  getResult,
  setInput,
  clear,
  query
})

onUnmounted(() => {
  if (geocoder) {
    geocoder.clear()
    geocoder = null
  }
})
</script>

<style scoped>
.mapbox-geocoder-wrapper {
  width: 100%;
}

.geocoder-container {
  width: 100%;
}

/* Personalización del geocoder */
:deep(.mapboxgl-ctrl-geocoder) {
  width: 100%;
  max-width: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-radius: 0.5rem;
  font-family: inherit;
  background-color: #ffffff;
}

:deep(.mapboxgl-ctrl-geocoder--input) {
  height: 42px;
  padding: 8px 40px;
  font-size: 14px;
  color: #1f2937;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
}

:deep(.mapboxgl-ctrl-geocoder--input:focus) {
  outline: none;
  border-color: #1313ec;
  box-shadow: 0 0 0 3px rgba(19, 19, 236, 0.1);
}

:deep(.mapboxgl-ctrl-geocoder--icon) {
  top: 11px;
  left: 12px;
  fill: #6b7280;
}

:deep(.mapboxgl-ctrl-geocoder--button) {
  top: 8px;
  right: 8px;
}

:deep(.mapboxgl-ctrl-geocoder--suggestions) {
  background-color: #ffffff !important;
}

:deep(.mapboxgl-ctrl-geocoder--suggestion) {
  padding: 10px;
  font-size: 14px;
  background-color: #ffffff !important;
  color: #1f2937 !important;
}

:deep(.mapboxgl-ctrl-geocoder--suggestion:hover) {
  background-color: #f3f4f6 !important;
}

:deep(.mapboxgl-ctrl-geocoder--suggestion-title) {
  font-weight: 600;
  color: #1f2937 !important;
}

:deep(.mapboxgl-ctrl-geocoder--suggestion-address) {
  color: #6b7280 !important;
  font-size: 12px;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :deep(.mapboxgl-ctrl-geocoder) {
    background-color: #1f2937;
  }

  :deep(.mapboxgl-ctrl-geocoder--input) {
    background-color: #374151;
    color: #f9fafb;
    border-color: #4b5563;
  }

  :deep(.mapboxgl-ctrl-geocoder--input:focus) {
    border-color: #1313ec;
  }

  :deep(.mapboxgl-ctrl-geocoder--icon) {
    fill: #9ca3af;
  }

  :deep(.mapboxgl-ctrl-geocoder--suggestion:hover) {
    background-color: #374151;
  }

  :deep(.mapboxgl-ctrl-geocoder--suggestion-title) {
    color: #f9fafb;
  }

  :deep(.mapboxgl-ctrl-geocoder--suggestion-address) {
    color: #9ca3af;
  }
}
</style>

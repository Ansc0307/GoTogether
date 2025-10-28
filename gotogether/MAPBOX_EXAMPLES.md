# Ejemplos de Uso - Geocoding en GoTogether

## 🎯 Ejemplos Prácticos

### 1. Búsqueda Simple en el Mapa

El buscador ya está integrado en `MapasView.vue`. Cuando escribes una ubicación:

```
Usuario escribe: "Plaza Murillo"
↓
Sistema busca automáticamente
↓
Muestra sugerencias con autocompletado
↓
Usuario selecciona resultado
↓
Mapa se centra en la ubicación
```

### 2. Agregar Punto de Interés con Búsqueda

En el modal de agregar punto:

```
Usuario abre modal "Agregar Punto"
↓
Busca en el geocoder: "Valle de la Luna"
↓
Sistema autocompleta:
  - Nombre: Valle de la Luna
  - Ubicación: La Paz, Bolivia
  - Coordenadas: (-16.5583, -68.0894)
  - Categoría: naturaleza (inferida)
↓
Usuario ajusta descripción si desea
↓
Guarda el punto en Firestore
```

### 3. Uso Programático del Composable

```vue
<template>
  <div>
    <!-- Input de búsqueda personalizado -->
    <input 
      v-model="searchQuery" 
      @input="handleSearch"
      placeholder="Buscar restaurantes..."
    />
    
    <!-- Loading -->
    <div v-if="loading">Buscando...</div>
    
    <!-- Resultados -->
    <ul v-if="results.length > 0">
      <li 
        v-for="result in results" 
        :key="result.id"
        @click="selectResult(result)"
      >
        <strong>{{ result.name }}</strong>
        <p>{{ result.location }}</p>
      </li>
    </ul>
    
    <!-- Error -->
    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGeocoding } from '@/composables/useGeocoding'

const searchQuery = ref('')
const { loading, error, results, forwardGeocode } = useGeocoding()

// Búsqueda con debounce
let searchTimeout = null

const handleSearch = () => {
  clearTimeout(searchTimeout)
  
  if (searchQuery.value.length < 3) {
    results.value = []
    return
  }
  
  searchTimeout = setTimeout(async () => {
    await forwardGeocode(searchQuery.value, {
      limit: 5,
      language: 'es',
      types: 'poi', // Solo puntos de interés
      proximity: { lng: -68.15, lat: -16.5 } // La Paz
    })
  }, 300) // Espera 300ms después de que el usuario deje de escribir
}

const selectResult = (result) => {
  console.log('Seleccionado:', result)
  // Hacer algo con el resultado
  // Por ejemplo: centrar mapa, guardar punto, etc.
}
</script>
```

### 4. Convertir Coordenadas a Dirección (Reverse Geocoding)

```vue
<template>
  <div>
    <button @click="getAddressFromClick">
      Obtener dirección de mi ubicación
    </button>
    <p v-if="address">{{ address }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGeocoding } from '@/composables/useGeocoding'

const address = ref('')
const { reverseGeocode } = useGeocoding()

const getAddressFromClick = async () => {
  // Obtener ubicación actual del usuario
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const result = await reverseGeocode({
        lng: position.coords.longitude,
        lat: position.coords.latitude
      })
      
      if (result) {
        address.value = result.name
      }
    })
  }
}
</script>
```

### 5. Búsqueda con Filtros Avanzados

```javascript
import { useGeocoding } from '@/composables/useGeocoding'

const { forwardGeocode } = useGeocoding()

// Solo restaurantes en Bolivia
const searchRestaurants = async (query) => {
  return await forwardGeocode(query, {
    countries: 'bo',
    types: 'poi',
    limit: 10,
    proximity: { lng: -68.15, lat: -16.5 }
  })
}

// Solo direcciones en La Paz
const searchAddresses = async (query) => {
  return await forwardGeocode(query, {
    countries: 'bo',
    types: 'address',
    bbox: [-68.5, -17, -67.5, -16], // Área de La Paz
    limit: 5
  })
}

// Lugares turísticos
const searchAttractions = async (query) => {
  return await forwardGeocode(query, {
    countries: 'bo,pe,cl,ar', // Países vecinos
    types: 'poi.landmark',
    language: 'es',
    limit: 8
  })
}
```

### 6. Autocompletado en Tiempo Real

```vue
<template>
  <div class="autocomplete">
    <input 
      v-model="query"
      @input="handleInput"
      @focus="showSuggestions = true"
      @blur="hideSuggestions"
      placeholder="Escribe una ubicación..."
    />
    
    <ul v-if="showSuggestions && suggestions.length > 0" class="suggestions">
      <li 
        v-for="suggestion in suggestions" 
        :key="suggestion.id"
        @mousedown="selectSuggestion(suggestion)"
      >
        {{ suggestion.name }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGeocoding } from '@/composables/useGeocoding'

const query = ref('')
const suggestions = ref([])
const showSuggestions = ref(false)
const { getAutocompleteSuggestions } = useGeocoding()

let timeout = null

const handleInput = async () => {
  clearTimeout(timeout)
  
  if (query.value.length < 2) {
    suggestions.value = []
    return
  }
  
  timeout = setTimeout(async () => {
    suggestions.value = await getAutocompleteSuggestions(query.value, {
      limit: 5,
      language: 'es',
      proximity: { lng: -68.15, lat: -16.5 }
    })
  }, 200)
}

const selectSuggestion = (suggestion) => {
  query.value = suggestion.name
  suggestions.value = []
  showSuggestions.value = false
  
  // Hacer algo con la sugerencia seleccionada
  console.log('Seleccionado:', suggestion)
}

const hideSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}
</script>

<style scoped>
.autocomplete {
  position: relative;
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.suggestions li {
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.suggestions li:hover {
  background: #f5f5f5;
}

.suggestions li:last-child {
  border-bottom: none;
}
</style>
```

### 7. Integración con el Mapa

```vue
<template>
  <div>
    <MapboxGeocoder
      ref="geocoderRef"
      placeholder="Buscar y agregar al mapa..."
      @result="addMarkerFromSearch"
    />
    
    <MapboxMap
      ref="mapRef"
      :points="points"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MapboxGeocoder from '@/components/mapas/MapboxGeocoder.vue'
import MapboxMap from '@/components/mapas/MapboxMap.vue'
import { useMap } from '@/composables/useMap'

const geocoderRef = ref(null)
const mapRef = ref(null)
const { points, agregarPunto } = useMap()

const addMarkerFromSearch = async (result) => {
  // Agregar punto desde el resultado de búsqueda
  await agregarPunto({
    name: result.name.split(',')[0],
    location: result.location,
    coordinates: result.coordinates,
    category: 'general',
    description: `Agregado desde búsqueda`
  })
  
  // Centrar mapa en el nuevo punto
  if (mapRef.value) {
    mapRef.value.panTo(result.coordinates)
  }
  
  // Limpiar búsqueda
  geocoderRef.value.clear()
}
</script>
```

### 8. Búsqueda por Categoría con Botones

```vue
<template>
  <div>
    <h3>Buscar por categoría:</h3>
    <div class="category-buttons">
      <button @click="searchByCategory('restaurante')">
        🍴 Restaurantes
      </button>
      <button @click="searchByCategory('hotel')">
        🏨 Hoteles
      </button>
      <button @click="searchByCategory('atraccion')">
        🎭 Atracciones
      </button>
      <button @click="searchByCategory('naturaleza')">
        🌲 Naturaleza
      </button>
    </div>
    
    <ul v-if="results.length > 0">
      <li v-for="result in results" :key="result.id">
        {{ result.name }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGeocoding } from '@/composables/useGeocoding'

const results = ref([])
const { forwardGeocode } = useGeocoding()

const categoryKeywords = {
  restaurante: 'restaurant',
  hotel: 'hotel',
  atraccion: 'museum landmark',
  naturaleza: 'park nature'
}

const searchByCategory = async (category) => {
  const keyword = categoryKeywords[category]
  
  results.value = await forwardGeocode(keyword, {
    countries: 'bo',
    types: 'poi',
    limit: 20,
    proximity: { lng: -68.15, lat: -16.5 },
    language: 'es'
  })
}
</script>
```

## 💡 Tips y Mejores Prácticas

### 1. Debounce en Búsquedas

Siempre usa debounce para evitar hacer demasiadas llamadas a la API:

```javascript
let timeout = null

const search = (query) => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    // Hacer búsqueda
  }, 300) // 300ms después de que el usuario deje de escribir
}
```

### 2. Usar Proximity

Prioriza resultados cercanos al usuario:

```javascript
const userLocation = { lng: -68.15, lat: -16.5 }

await forwardGeocode('plaza', {
  proximity: userLocation
})
```

### 3. Limitar por País

Para resultados más precisos:

```javascript
await forwardGeocode('La Paz', {
  countries: 'bo' // Solo Bolivia
})
```

### 4. Cache de Resultados

Guarda búsquedas frecuentes:

```javascript
const cache = new Map()

const searchWithCache = async (query) => {
  if (cache.has(query)) {
    return cache.get(query)
  }
  
  const results = await forwardGeocode(query)
  cache.set(query, results)
  
  return results
}
```

### 5. Manejo de Errores

```javascript
try {
  const results = await forwardGeocode(query)
  if (results.length === 0) {
    console.log('No se encontraron resultados')
  }
} catch (error) {
  console.error('Error en búsqueda:', error)
  // Mostrar mensaje al usuario
}
```

---

## 🎓 Recursos

- **Documentación completa:** `MAPBOX_GEOCODING.md`
- **Configuración:** `MAPBOX_SETUP.md`
- **API Mapbox:** [docs.mapbox.com/api/search/geocoding](https://docs.mapbox.com/api/search/geocoding/)

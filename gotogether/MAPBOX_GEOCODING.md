# Funcionalidades de Geocoding de Mapbox

Este documento describe las funcionalidades de **Address Autofill**, **Search Box** y **Geocoding** implementadas en GoTogether usando Mapbox.

## 📦 Dependencias Instaladas

```bash
npm install @mapbox/mapbox-gl-geocoder
```

## 🗺️ Componentes Disponibles

### 1. MapboxGeocoder.vue

Componente de búsqueda con autocompletado que integra el Geocoder de Mapbox.

**Ubicación:** `src/components/mapas/MapboxGeocoder.vue`

#### Props

- `placeholder` (String): Texto del placeholder. Default: `'Buscar ubicación...'`
- `proximity` (Object): Coordenadas para priorizar resultados cercanos. Ej: `{ lng: -68.15, lat: -16.5 }`
- `bbox` (Array): Límites geográficos `[minLng, minLat, maxLng, maxLat]`
- `countries` (String): Códigos de países separados por coma. Ej: `'bo,pe,ar'`
- `types` (String): Tipos de lugares a buscar. Default incluye: `'country,region,postcode,district,place,locality,neighborhood,address,poi'`
- `limit` (Number): Número máximo de resultados. Default: `5`
- `language` (String): Idioma de los resultados. Default: `'es'`

#### Eventos

- `@result`: Se emite cuando se selecciona un resultado
  ```javascript
  {
    name: String,          // Nombre del lugar
    location: String,      // Dirección completa
    coordinates: {         // Coordenadas
      lng: Number,
      lat: Number
    },
    type: String,          // Tipo de lugar
    properties: Object,    // Propiedades adicionales
    bbox: Array,          // Límites geográficos
    context: Array        // Contexto (país, región, etc.)
  }
  ```
- `@results`: Se emite con todos los resultados de búsqueda
- `@clear`: Se emite cuando se limpia la búsqueda
- `@loading`: Se emite durante la carga
- `@error`: Se emite en caso de error

#### Métodos Expuestos

```javascript
// Obtener el resultado actual
geocoderRef.value.getResult()

// Establecer el texto de búsqueda
geocoderRef.value.setInput('La Paz')

// Limpiar la búsqueda
geocoderRef.value.clear()

// Realizar búsqueda programática
geocoderRef.value.query('Mirador Killi Killi')
```

#### Ejemplo de Uso

```vue
<template>
  <MapboxGeocoder
    ref="geocoderRef"
    placeholder="Buscar ubicación..."
    :proximity="{ lng: -68.15, lat: -16.5 }"
    countries="bo"
    @result="handleResult"
  />
</template>

<script setup>
import { ref } from 'vue'
import MapboxGeocoder from '@/components/mapas/MapboxGeocoder.vue'

const geocoderRef = ref(null)

const handleResult = (result) => {
  console.log('Ubicación seleccionada:', result)
  // Hacer algo con el resultado
}
</script>
```

---

### 2. useGeocoding Composable

Composable para usar las funcionalidades de geocoding programáticamente.

**Ubicación:** `src/composables/useGeocoding.js`

#### Estado Reactivo

- `loading` (Boolean): Indica si hay una operación en curso
- `error` (String|null): Mensaje de error si existe
- `results` (Array): Array con los resultados de búsqueda

#### Métodos

##### forwardGeocode(query, options)

Convierte texto (dirección/lugar) en coordenadas.

```javascript
const { forwardGeocode } = useGeocoding()

const results = await forwardGeocode('La Paz, Bolivia', {
  limit: 5,
  language: 'es',
  proximity: { lng: -68.15, lat: -16.5 },
  bbox: [-70, -17, -66, -15],
  countries: 'bo',
  types: 'place,locality,neighborhood'
})
```

**Opciones disponibles:**
- `limit`: Número de resultados (default: 5)
- `language`: Idioma ('es', 'en', etc.)
- `proximity`: Objeto `{ lng, lat }` para priorizar resultados cercanos
- `bbox`: Array `[minLng, minLat, maxLng, maxLat]`
- `countries`: Códigos de países separados por coma
- `types`: Tipos de lugares a buscar

##### reverseGeocode(coordinates, options)

Convierte coordenadas en dirección/lugar.

```javascript
const { reverseGeocode } = useGeocoding()

const result = await reverseGeocode(
  { lng: -68.15, lat: -16.5 },
  {
    limit: 1,
    language: 'es',
    types: 'address,place'
  }
)

console.log(result.name) // Ej: "La Paz, Bolivia"
```

##### getAutocompleteSuggestions(query, options)

Obtiene sugerencias de autocompletado mientras el usuario escribe.

```javascript
const { getAutocompleteSuggestions } = useGeocoding()

const suggestions = await getAutocompleteSuggestions('La Pa', {
  limit: 5,
  proximity: { lng: -68.15, lat: -16.5 }
})
```

##### getPlaceDetails(placeId)

Obtiene información detallada de un lugar específico por su ID.

```javascript
const { getPlaceDetails } = useGeocoding()

const details = await getPlaceDetails('place.123456')
```

##### clearResults()

Limpia los resultados y errores almacenados.

```javascript
const { clearResults } = useGeocoding()
clearResults()
```

#### Ejemplo Completo

```vue
<template>
  <div>
    <input 
      v-model="searchText" 
      @input="handleSearch"
      placeholder="Buscar ubicación..."
    />
    
    <div v-if="loading">Buscando...</div>
    <div v-if="error">Error: {{ error }}</div>
    
    <ul>
      <li 
        v-for="result in results" 
        :key="result.id"
        @click="selectLocation(result)"
      >
        {{ result.name }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useGeocoding } from '@/composables/useGeocoding'

const searchText = ref('')
const { loading, error, results, getAutocompleteSuggestions } = useGeocoding()

const handleSearch = async () => {
  if (searchText.value.length > 2) {
    await getAutocompleteSuggestions(searchText.value, {
      limit: 5,
      language: 'es'
    })
  }
}

const selectLocation = (result) => {
  console.log('Ubicación seleccionada:', result.coordinates)
}
</script>
```

---

## 🎯 Casos de Uso

### 1. Agregar Punto de Interés con Búsqueda

El modal `AddPointModal.vue` ahora incluye un buscador con geocoding que autocompleta los campos:

- Busca un lugar en el geocoder
- Los campos de nombre, ubicación y coordenadas se completan automáticamente
- La categoría se infiere del tipo de lugar cuando es posible

### 2. Buscar Ubicaciones en el Mapa

La vista `MapasView.vue` incluye un buscador que:

- Permite buscar cualquier ubicación
- Centra el mapa en el resultado seleccionado
- Muestra sugerencias mientras escribes

### 3. Obtener Dirección desde Coordenadas

```javascript
import { useGeocoding } from '@/composables/useGeocoding'

const { reverseGeocode } = useGeocoding()

// Al hacer click en el mapa
const handleMapClick = async (coordinates) => {
  const location = await reverseGeocode(coordinates)
  console.log('Dirección:', location.name)
}
```

### 4. Búsqueda con Filtros Personalizados

```javascript
const { forwardGeocode } = useGeocoding()

// Buscar solo restaurantes en Bolivia
const restaurants = await forwardGeocode('restaurante', {
  countries: 'bo',
  types: 'poi',
  limit: 10
})
```

---

## 🔧 Configuración

Las funcionalidades de geocoding usan el mismo Access Token configurado en `.env`:

```env
VITE_MAPBOX_ACCESS_TOKEN=pk.tu_token_aqui
```

No requiere configuración adicional. El token debe tener permisos para:
- Mapbox Geocoding API
- Mapbox Maps API

---

## 🎨 Personalización de Estilos

El componente `MapboxGeocoder.vue` incluye estilos personalizados que puedes modificar:

```vue
<style scoped>
/* Personalización del geocoder */
:deep(.mapboxgl-ctrl-geocoder) {
  width: 100%;
  border-radius: 0.5rem;
  /* Tus estilos aquí */
}
</style>
```

Soporta modo oscuro automáticamente mediante `prefers-color-scheme`.

---

## 📝 Tipos de Lugares Disponibles

- `country`: País
- `region`: Región/Estado
- `postcode`: Código postal
- `district`: Distrito
- `place`: Ciudad/Pueblo
- `locality`: Localidad
- `neighborhood`: Barrio
- `address`: Dirección
- `poi`: Punto de interés (restaurantes, hoteles, etc.)
- `poi.landmark`: Monumentos

---

## 🌍 Límites y Consideraciones

### Cuota Gratuita de Mapbox

- **100,000 búsquedas gratis por mes**
- Después: $0.50 por cada 1,000 búsquedas adicionales

### Mejores Prácticas

1. **Usar proximity**: Prioriza resultados cercanos al usuario
2. **Limitar países**: Usa `countries` para resultados más precisos
3. **Tipos específicos**: Define `types` según lo que buscas
4. **Debounce**: Implementa debounce en búsquedas de autocompletado
5. **Cache**: Guarda resultados frecuentes para reducir llamadas

---

## 🐛 Troubleshooting

### El geocoder no aparece

- Verifica que el Access Token esté configurado en `.env`
- Reinicia el servidor de desarrollo después de modificar `.env`

### Los resultados no son precisos

- Usa `proximity` para priorizar resultados cercanos
- Especifica `countries` para limitar la región
- Ajusta `types` según lo que buscas

### Error "Token inválido"

- Verifica que el token empiece con `pk.`
- Confirma que el token tenga permisos de Geocoding API
- Revisa que no haya espacios al inicio o final del token

---

## 📚 Recursos Adicionales

- [Mapbox Geocoding API Docs](https://docs.mapbox.com/api/search/geocoding/)
- [Mapbox GL Geocoder Plugin](https://github.com/mapbox/mapbox-gl-geocoder)
- [Tipos de lugares](https://docs.mapbox.com/api/search/geocoding/#data-types)
- [Límites de uso](https://www.mapbox.com/pricing/)

---

## ✅ Checklist de Implementación

- [x] Instalar `@mapbox/mapbox-gl-geocoder`
- [x] Crear componente `MapboxGeocoder.vue`
- [x] Crear composable `useGeocoding.js`
- [x] Integrar en `AddPointModal.vue`
- [x] Integrar en `MapasView.vue`
- [x] Agregar estilos y dark mode
- [x] Documentar uso y ejemplos

¡Listo para usar! 🎉

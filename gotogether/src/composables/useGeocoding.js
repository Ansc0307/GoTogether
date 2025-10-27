import { ref } from 'vue'
import { MAPBOX_CONFIG } from '../config/mapbox'

/**
 * Composable para funcionalidades de geocoding de Mapbox
 */
export function useGeocoding() {
  const loading = ref(false)
  const error = ref(null)
  const results = ref([])

  const baseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places'

  /**
   * Búsqueda directa (Forward Geocoding)
   * Convierte una dirección/lugar en coordenadas
   * @param {string} query - Texto de búsqueda
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Array>} Array de resultados
   */
  const forwardGeocode = async (query, options = {}) => {
    if (!query || !query.trim()) {
      error.value = 'Query de búsqueda vacío'
      return []
    }

    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams({
        access_token: MAPBOX_CONFIG.accessToken,
        limit: options.limit || 5,
        language: options.language || 'es',
        ...options
      })

      // Agregar proximity si está disponible
      if (options.proximity) {
        params.append('proximity', `${options.proximity.lng},${options.proximity.lat}`)
      }

      // Agregar bbox si está disponible
      if (options.bbox && Array.isArray(options.bbox) && options.bbox.length === 4) {
        params.append('bbox', options.bbox.join(','))
      }

      // Agregar countries si está disponible
      if (options.countries) {
        params.append('country', options.countries)
      }

      // Agregar types si está disponible
      if (options.types) {
        params.append('types', options.types)
      }

      const url = `${baseUrl}/${encodeURIComponent(query)}.json?${params}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Error en la búsqueda: ${response.statusText}`)
      }

      const data = await response.json()
      
      results.value = data.features.map(feature => ({
        id: feature.id,
        name: feature.place_name,
        location: feature.place_name,
        coordinates: {
          lng: feature.center[0],
          lat: feature.center[1]
        },
        type: feature.place_type?.[0] || 'place',
        properties: feature.properties || {},
        bbox: feature.bbox,
        context: feature.context || [],
        relevance: feature.relevance
      }))

      return results.value
    } catch (err) {
      error.value = err.message
      console.error('Error en forward geocoding:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Búsqueda inversa (Reverse Geocoding)
   * Convierte coordenadas en dirección/lugar
   * @param {Object} coordinates - Objeto con {lng, lat}
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object|null>} Resultado principal o null
   */
  const reverseGeocode = async (coordinates, options = {}) => {
    if (!coordinates || !coordinates.lng || !coordinates.lat) {
      error.value = 'Coordenadas inválidas'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams({
        access_token: MAPBOX_CONFIG.accessToken,
        limit: options.limit || 1,
        language: options.language || 'es',
        ...options
      })

      // Agregar types si está disponible
      if (options.types) {
        params.append('types', options.types)
      }

      const url = `${baseUrl}/${coordinates.lng},${coordinates.lat}.json?${params}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Error en la búsqueda inversa: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.features && data.features.length > 0) {
        const feature = data.features[0]
        
        const result = {
          id: feature.id,
          name: feature.place_name,
          location: feature.place_name,
          coordinates: {
            lng: feature.center[0],
            lat: feature.center[1]
          },
          type: feature.place_type?.[0] || 'place',
          properties: feature.properties || {},
          bbox: feature.bbox,
          context: feature.context || []
        }

        results.value = [result]
        return result
      }

      return null
    } catch (err) {
      error.value = err.message
      console.error('Error en reverse geocoding:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener sugerencias de autocompletado
   * @param {string} query - Texto parcial
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Array>} Array de sugerencias
   */
  const getAutocompleteSuggestions = async (query, options = {}) => {
    if (!query || query.length < 2) {
      results.value = []
      return []
    }

    return await forwardGeocode(query, {
      ...options,
      limit: options.limit || 5,
      autocomplete: true
    })
  }

  /**
   * Obtener información detallada de un lugar por ID
   * @param {string} placeId - ID del lugar de Mapbox
   * @returns {Promise<Object|null>} Información del lugar
   */
  const getPlaceDetails = async (placeId) => {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams({
        access_token: MAPBOX_CONFIG.accessToken,
        language: 'es'
      })

      const url = `${baseUrl}/${encodeURIComponent(placeId)}.json?${params}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Error obteniendo detalles: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.features && data.features.length > 0) {
        const feature = data.features[0]
        return {
          id: feature.id,
          name: feature.place_name,
          location: feature.place_name,
          coordinates: {
            lng: feature.center[0],
            lat: feature.center[1]
          },
          type: feature.place_type?.[0] || 'place',
          properties: feature.properties || {},
          bbox: feature.bbox,
          context: feature.context || []
        }
      }

      return null
    } catch (err) {
      error.value = err.message
      console.error('Error obteniendo detalles del lugar:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Limpiar resultados y errores
   */
  const clearResults = () => {
    results.value = []
    error.value = null
  }

  return {
    // Estado
    loading,
    error,
    results,

    // Métodos
    forwardGeocode,
    reverseGeocode,
    getAutocompleteSuggestions,
    getPlaceDetails,
    clearResults
  }
}

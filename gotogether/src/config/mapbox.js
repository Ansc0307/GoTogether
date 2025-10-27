// Configuración de Mapbox
// IMPORTANTE: Reemplaza 'TU_ACCESS_TOKEN_AQUI' con tu propio Access Token de Mapbox

export const MAPBOX_CONFIG = {
  // Obtén tu Access Token en: https://account.mapbox.com/access-tokens/
  accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'TU_ACCESS_TOKEN_AQUI',
  
  // Estilo del mapa (puedes cambiarlo)
  style: 'mapbox://styles/mapbox/streets-v12', // streets, outdoors, light, dark, satellite
  
  // Idioma
  language: 'es'
}

// Centro por defecto (La Paz, Bolivia)
export const DEFAULT_CENTER = {
  lng: -68.15,
  lat: -16.5
}

// Zoom por defecto
export const DEFAULT_ZOOM = 12

// Límites de Bolivia (para restringir el mapa si es necesario)
export const BOLIVIA_BOUNDS = [
  [-69.6409, -22.8968], // [oeste, sur]
  [-57.4532, -9.6689]   // [este, norte]
]

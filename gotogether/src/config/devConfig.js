// Configuración de apoyo para desarrollo local cuando aún no hay autenticación/UI
// NUNCA uses estos valores para producción.

export const USE_DEV_FAKE_AUTH = false // Auth real habilitada

export const DEV_DEFAULT_USER = {
  uid: 'dev-user',
  displayName: 'Dev User',
  email: 'dev@gotogether.local'
}

// Crea un trip en Firestore con este ID o reemplázalo por uno real
export const DEV_DEFAULT_TRIP_ID = 'dev-trip'

// Mostrar tarjetas de ejemplo junto con las reales durante desarrollo
export const SHOW_DEV_MOCK_VOTINGS = false

// Base pública para compartir enlaces en lugar de localhost (opcional)
// Si está vacío, se copiará solo la ruta relativa (p.ej., /voting/ID)
export const PUBLIC_SHARE_BASE_URL = '' // ejemplo: 'https://gotogether.app'

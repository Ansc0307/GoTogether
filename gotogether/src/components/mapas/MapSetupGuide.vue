<template>
  <div class="flex items-center justify-center min-h-[400px] p-8">
    <div class="max-w-2xl bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl p-6 shadow-lg">
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0">
          <svg class="w-12 h-12 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
            <path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z"></path>
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="text-xl font-bold text-yellow-900 dark:text-yellow-200 mb-2">
            🗺️ Google Maps no está configurado
          </h3>
          <p class="text-yellow-800 dark:text-yellow-300 mb-4">
            Para usar el mapa interactivo, necesitas configurar tu API Key de Google Maps.
          </p>
          
          <div class="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-yellow-200 dark:border-yellow-700">
            <h4 class="font-bold text-gray-900 dark:text-white mb-2">
              📝 Pasos rápidos:
            </h4>
            <ol class="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>Obtén tu API Key en <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" class="text-blue-600 hover:underline">Google Cloud Console</a></li>
              <li>Habilita <strong>Maps JavaScript API</strong>, <strong>Places API</strong> y <strong>Geocoding API</strong></li>
              <li>Crea un archivo <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">.env</code> en la carpeta <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">gotogether/</code></li>
              <li>Agrega: <code class="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">VITE_GOOGLE_MAPS_API_KEY=tu-api-key</code></li>
              <li>Reinicia el servidor de desarrollo</li>
            </ol>
          </div>
          
          <div class="flex gap-3">
            <a 
              href="https://console.cloud.google.com/google/maps-apis" 
              target="_blank"
              class="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
            >
              <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M224,104h-8V56a8,8,0,0,0-8-8H136a8,8,0,0,0,0,16h52.69L128,124.69,67.31,64H120a8,8,0,0,0,0-16H48a8,8,0,0,0-8,8v72a8,8,0,0,0,16,0V75.31L116.69,136,56,196.69V144a8,8,0,0,0-16,0v72a8,8,0,0,0,8,8h72a8,8,0,0,0,0-16H67.31L128,147.31,188.69,208H136a8,8,0,0,0,0,16h72a8,8,0,0,0,8-8V144a8,8,0,0,0-16,0v52.69L139.31,136,200,75.31V128a8,8,0,0,0,16,0V104Z"></path>
              </svg>
              Obtener API Key
            </a>
            <button 
              @click="openDocumentation"
              class="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-yellow-400 dark:border-yellow-600 text-yellow-900 dark:text-yellow-200 rounded-lg font-medium transition-colors"
            >
              <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM176,88a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,88Zm0,40a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,128Zm0,40a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,168Z"></path>
              </svg>
              Ver Documentación
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const openDocumentation = () => {
  // Esto abrirá el archivo de documentación si está disponible
  // O puedes mostrar un modal con instrucciones
  alert('Revisa el archivo GOOGLE_MAPS_SETUP.md en la carpeta gotogether/ para instrucciones detalladas.')
}
</script>

<style scoped>
code {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}
</style>

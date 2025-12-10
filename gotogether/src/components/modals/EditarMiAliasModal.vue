<!-- components/trips/modals/EditarMiAliasModal.vue -->
<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
      <!-- Icono -->
      <div class="flex items-center justify-center mb-4">
        <div class="p-3 bg-blue-100 rounded-full">
          <span class="material-symbols-outlined text-blue-600 text-3xl">badge</span>
        </div>
      </div>
      
      <!-- Título -->
      <h3 class="text-xl font-bold text-gray-800 text-center mb-3">
        Mi alias en este viaje
      </h3>
      
      <!-- Info -->
      <div class="text-center mb-6">
        <p class="text-gray-600">
          ¿Cómo quieres que te vean en 
          <span class="font-semibold">"{{ tripName }}"</span>?
        </p>
      </div>
      
      <!-- Info del usuario -->
      <div class="bg-gray-50 rounded-lg p-4 mb-4">
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p class="text-gray-600 mb-1">Tu correo</p>
            <p class="font-medium truncate">{{ userEmail }}</p>
          </div>
          <div>
            <p class="text-gray-600 mb-1">Nombre actual</p>
            <p class="font-medium">{{ userDisplayName }}</p>
          </div>
        </div>
      </div>
      
      <!-- Campo para alias -->
      <div class="mb-6">
        <label class="label">Mi alias en este viaje</label>
        <input
          v-model="alias"
          type="text"
          class="input"
          placeholder="Ej: Aventurero, Planificador, Guía..."
          :disabled="saving"
          @keyup.enter="saveAlias"
        />
        <p class="text-sm text-gray-500 mt-2">
          Este será el nombre que verán otros integrantes
        </p>
        
        <!-- Sugerencias -->
        <div class="mt-3">
          <p class="text-xs text-gray-500 mb-2">Sugerencias:</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="suggestion in suggestions"
              :key="suggestion"
              @click="alias = suggestion"
              class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Botones -->
      <div class="flex gap-3">
        <button
          @click="$emit('close')"
          class="btn-outline flex-1"
          :disabled="saving"
        >
          Cancelar
        </button>
        <button
          @click="saveAlias"
          class="btn-primary flex items-center justify-center gap-2 flex-1"
          :disabled="!alias.trim() || saving"
        >
          <span v-if="saving" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
          <span v-else class="material-symbols-outlined text-base">save</span>
          {{ saving ? 'Guardando...' : 'Guardar alias' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTrips } from '@/composables/useTrips'

const props = defineProps({
  tripId: String,
  tripName: String,
  currentAlias: String,
  userEmail: String,
  userDisplayName: String
})

const emit = defineEmits(['close', 'alias-updated'])

const { updateMemberAlias } = useTrips()

const alias = ref('')
const saving = ref(false)

// Sugerencias de alias
const suggestions = ref([
  'Explorador/a',
  'Aventurero/a',
  'Planificador/a',
  'Guía',
  'Fotógrafo/a',
  'Chef',
  'Navegante',
  'Coordinador/a'
])

// Inicializar con alias actual o nombre
onMounted(() => {
  alias.value = props.currentAlias || props.userDisplayName || ''
})

// Guardar alias
const saveAlias = async () => {
  if (!alias.value.trim()) {
    alert('Escribe un alias')
    return
  }

  saving.value = true
  
  try {
    // Usar updateMemberAlias de useTrips
    const result = await updateMemberAlias(
      props.tripId, 
      props.userEmail, 
      alias.value.trim()
    )
    
    if (result.success) {
      emit('alias-updated', alias.value.trim())
      emit('close')
    } else {
      alert('Error: ' + result.error)
    }
  } catch (error) {
    console.error('Error guardando alias:', error)
    alert('Error al guardar el alias')
  } finally {
    saving.value = false
  }
}
</script>
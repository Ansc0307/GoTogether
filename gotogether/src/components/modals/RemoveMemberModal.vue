<!-- components/trips/modals/RemoveMemberModal.vue -->
<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
      <!-- Icono -->
      <div class="flex items-center justify-center mb-4">
        <div class="p-3 bg-red-100 rounded-full">
          <span class="material-symbols-outlined text-red-600 text-3xl">person_remove</span>
        </div>
      </div>
      
      <!-- Título -->
      <h3 class="text-xl font-bold text-gray-800 text-center mb-3">
        Eliminar integrante
      </h3>
      
      <!-- Info del miembro -->
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
          <span class="text-2xl font-bold text-gray-700">
            {{ getInitials(member.alias) }}
          </span>
        </div>
        <p class="text-gray-800 font-medium mb-1">
          {{ member.alias }}
        </p>
        <p class="text-sm text-gray-500">
          {{ member.email }}
        </p>
      </div>
      
      <!-- Advertencia -->
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex items-start gap-3">
          <span class="material-symbols-outlined text-red-500 mt-0.5">warning</span>
          <div>
            <p class="text-sm font-medium text-red-800 mb-1">
              Esta acción no se puede deshacer
            </p>
            <p class="text-xs text-red-600">
              El integrante será removido del viaje y perderá acceso a todas las funcionalidades.
            </p>
          </div>
        </div>
      </div>
      
      <!-- Confirmación -->
      <div class="mb-6">
        <label class="flex items-start gap-3 cursor-pointer">
          <input
            v-model="confirmed"
            type="checkbox"
            class="mt-1 text-red-600 rounded focus:ring-red-500"
            :disabled="removing"
          />
          <div>
            <p class="text-sm font-medium text-gray-800">
              Confirmo que deseo eliminar a {{ member.alias }} del viaje
            </p>
          </div>
        </label>
      </div>
      
      <!-- Botones -->
      <div class="flex gap-3">
        <button
          @click="$emit('cancel')"
          class="btn-outline flex-1"
          :disabled="removing"
        >
          Cancelar
        </button>
        <button
          @click="confirmRemove"
          class="btn bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2 flex-1"
          :disabled="!confirmed || removing"
        >
          <span v-if="removing" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
          <span v-else class="material-symbols-outlined text-base">delete</span>
          {{ removing ? 'Eliminando...' : 'Eliminar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  member: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const confirmed = ref(false)
const removing = ref(false)

// Obtener iniciales
const getInitials = (name) => {
  if (!name) return '?'
  return name.slice(0, 2).toUpperCase()
}

// Confirmar eliminación
const confirmRemove = () => {
  if (!confirmed.value) return
  
  removing.value = true
  emit('confirm')
}
</script>
<!-- components/trips/modals/EditAliasModal.vue -->
<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
      <!-- Icono -->
      <div class="flex items-center justify-center mb-4">
        <div class="p-3 bg-blue-100 rounded-full">
          <span class="material-symbols-outlined text-blue-600 text-3xl">edit</span>
        </div>
      </div>
      
      <!-- Título -->
      <h3 class="text-xl font-bold text-gray-800 text-center mb-3">
        Editar alias
      </h3>
      
      <!-- Info del miembro -->
      <div class="bg-gray-50 rounded-lg p-4 mb-4">
        <p class="text-sm text-gray-600 mb-1">Correo electrónico</p>
        <p class="font-medium text-gray-800">{{ member.email }}</p>
      </div>
      
      <!-- Campo para editar alias -->
      <div class="mb-6">
        <label class="label">Nuevo alias</label>
        <input
          v-model="newAlias"
          type="text"
          class="input"
          placeholder="Ej: Juan, Ana, Carlos..."
          :disabled="saving"
          @keyup.enter="saveAlias"
        />
        <p class="text-sm text-gray-500 mt-2">
          Este será el nombre visible en el viaje
        </p>
      </div>
      
      <!-- Botones -->
      <div class="flex gap-3">
        <button
          @click="$emit('cancel')"
          class="btn-outline flex-1"
          :disabled="saving"
        >
          Cancelar
        </button>
        <button
          @click="saveAlias"
          class="btn-primary flex items-center justify-center gap-2 flex-1"
          :disabled="!canSave || saving"
        >
          <span v-if="saving" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
          <span v-else class="material-symbols-outlined text-base">save</span>
          {{ saving ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  member: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save', 'cancel'])

const newAlias = ref('')
const saving = ref(false)

// Inicializar con el alias actual
onMounted(() => {
  newAlias.value = props.member.alias || ''
})

// Verificar si hay cambios
const canSave = computed(() => {
  return newAlias.value.trim() && newAlias.value.trim() !== props.member.alias
})

// Guardar alias
const saveAlias = async () => {
  if (!canSave.value) return
  
  saving.value = true
  
  try {
    emit('save', newAlias.value.trim())
  } finally {
    saving.value = false
  }
}
</script>
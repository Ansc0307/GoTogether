<!-- components/trips/MembersList.vue -->
<template>
  <div class="bg-white rounded-xl border p-6">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">
      Integrantes ({{ members.length }})
    </h2>

    <div v-if="members.length === 0" class="text-center py-8">
      <p class="text-gray-500">No hay integrantes</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="member in members"
        :key="member.email"
        class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
      >
        <!-- Info del miembro -->
        <div class="flex items-center gap-3 flex-1">
          <!-- Avatar -->
          <div class="relative">
            <div 
              class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
              :class="member.isOrganizer ? 'bg-primary' : 'bg-gray-500'"
            >
              {{ getInitials(member.alias) }}
            </div>
            <span 
              v-if="member.isOrganizer"
              class="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
              title="Organizador"
            >
              ★
            </span>
          </div>
          
          <!-- Detalles -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="font-medium text-gray-800 truncate">
                {{ member.alias }}
              </p>
            </div>
            <p class="text-sm text-gray-500 truncate">{{ member.email }}</p>
          </div>
        </div>

        <!-- Acciones -->
        <div class="flex items-center gap-3">
          <!-- Editar alias -->
          <div v-if="!member.isOrganizer" class="relative group">
            <input
              :value="member.alias"
              @input="updateAlias(member.email, $event.target.value)"
              type="text"
              class="border rounded px-3 py-2 text-sm w-32 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Editar alias"
            />
            <span class="absolute -top-8 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">
              Escribe y presiona Enter
            </span>
          </div>

          <!-- Botón eliminar -->
          <button
            v-if="!member.isOrganizer"
            @click="$emit('remove-member', member.email)"
            class="text-red-500 hover:text-red-700 px-3 py-2 rounded hover:bg-red-50 transition"
            title="Eliminar del viaje"
          >
            <span class="material-symbols-outlined text-base">delete</span>
          </button>

          <span v-if="member.isOrganizer" class="text-sm text-gray-400 px-3">
            Organizador
          </span>
        </div>
      </div>
    </div>

    <!-- Nota -->
    <div v-if="members.length > 0" class="mt-6 pt-4 border-t border-gray-100">
      <p class="text-sm text-gray-500">
        <span class="material-symbols-outlined text-sm align-middle mr-1">info</span>
        Los organizadores no pueden ser eliminados. Haz clic en el alias para editarlo.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  members: Array
})

const emit = defineEmits(['remove-member', 'update-alias'])

let timeoutId = null

// Actualizar alias con debounce (espera 500ms después de escribir)
const updateAlias = (email, alias) => {
  clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    if (alias.trim() && alias.trim() !== props.members.find(m => m.email === email)?.alias) {
      emit('update-alias', email, alias.trim())
    }
  }, 500)
}

// Obtener iniciales
const getInitials = (name) => {
  if (!name) return '?'
  return name.slice(0, 2).toUpperCase()
}
</script>
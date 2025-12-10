<!-- components/trips/MembersList.vue -->
<template>
  <div class="bg-white rounded-xl border p-4 sm:p-6">
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
        class="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50"
      >
        <!-- Info del miembro -->
        <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <!-- Avatar -->
          <div class="relative flex-shrink-0">
            <div 
              class="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-white text-sm sm:text-base"
              :class="member.isOrganizer ? 'bg-primary' : 'bg-gray-500'"
            >
              {{ getInitials(member.alias) }}
            </div>
            <span 
              v-if="member.isOrganizer"
              class="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs"
              title="Organizador"
            >
              ★
            </span>
          </div>
          
          <!-- Detalles - Ocupa el espacio disponible -->
          <div class="flex-1 min-w-0 overflow-hidden">
            <div class="flex items-center gap-1 sm:gap-2">
              <p class="font-medium text-gray-800 truncate text-sm sm:text-base">
                {{ member.alias }}
              </p>
            </div>
            <p class="text-xs sm:text-sm text-gray-500 truncate">{{ member.email }}</p>
          </div>
        </div>

        <!-- Acciones -->
        <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <!-- Botón editar -->
          <button
            v-if="!member.isOrganizer"
            @click="$emit('edit-member', member)"
            class="text-blue-500 hover:text-blue-700 p-1 sm:p-2 rounded-lg hover:bg-blue-50 transition text-sm"
            title="Editar alias"
          >
            <span class="material-symbols-outlined text-sm sm:text-base">edit</span>
          </button>

          <!-- Botón eliminar -->
          <button
            v-if="!member.isOrganizer"
            @click="$emit('remove-member', member)"
            class="text-red-500 hover:text-red-700 p-1 sm:p-2 rounded-lg hover:bg-red-50 transition text-sm"
            title="Eliminar del viaje"
          >
            <span class="material-symbols-outlined text-sm sm:text-base">delete</span>
          </button>

          <span v-if="member.isOrganizer" class="text-xs sm:text-sm text-gray-400 px-1 sm:px-2 whitespace-nowrap">
            Org.
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  members: Array
})

defineEmits(['edit-member', 'remove-member'])

// Obtener iniciales
const getInitials = (name) => {
  if (!name) return '?'
  return name.slice(0, 2).toUpperCase()
}
</script>
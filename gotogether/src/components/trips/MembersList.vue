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
        <div class="flex items-center gap-2">
          <!-- Botón editar -->
          <button
            v-if="!member.isOrganizer"
            @click="$emit('edit-member', member)"
            class="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition"
            title="Editar alias"
          >
            <span class="material-symbols-outlined text-base">edit</span>
          </button>

          <!-- Botón eliminar -->
          <button
            v-if="!member.isOrganizer"
            @click="$emit('remove-member', member)"
            class="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"
            title="Eliminar del viaje"
          >
            <span class="material-symbols-outlined text-base">delete</span>
          </button>

          <span v-if="member.isOrganizer" class="text-sm text-gray-400 px-2">
            Organizador
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
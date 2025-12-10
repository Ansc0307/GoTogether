<template>
  <div class="container mx-auto p-3 sm:p-4 max-w-4xl">
    <!-- Encabezado con mejor spacing -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-800">Integrantes</h1>
      <button @click="showAddModal = true" class="btn-primary w-full sm:w-auto text-sm sm:text-base py-2">
        + Agregar integrante
      </button>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
      <p class="mt-3 text-gray-600">Cargando...</p>
    </div>

    <div v-else class="space-y-4">
      <!-- Contador de miembros -->
      <div class="text-sm text-gray-600 px-2">
        Total: {{ membersList.length }} integrante{{ membersList.length !== 1 ? 's' : '' }}
      </div>
      
      <!-- Lista en contenedor scrollable si hay muchos -->
      <div class="max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
        <MembersList
          :members="membersList"
          @edit-member="openEditModal"
          @remove-member="openRemoveModal"
        />
      </div>
    </div>

    <!-- Modal agregar -->
    <AddMemberModal
      v-if="showAddModal"
      :trip-id="tripId"
      @members-added="loadData"
      @close="showAddModal = false"
    />

    <!-- Modal editar alias -->
    <EditAliasModal
      v-if="showEditModal && selectedMember"
      :member="selectedMember"
      @save="handleSaveAlias"
      @cancel="closeEditModal"
    />

    <!-- Modal eliminar miembro -->
    <RemoveMemberModal
      v-if="showRemoveModal && selectedMember"
      :member="selectedMember"
      @confirm="handleRemoveMember"
      @cancel="closeRemoveModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTrips } from '@/composables/useTrips'
import MembersList from '@/components/trips/MembersList.vue'
import AddMemberModal from '@/components/trips/AddMemberModal.vue'
import EditAliasModal from '@/components/modals/EditAliasModal.vue'
import RemoveMemberModal from '@/components/modals/RemoveMemberModal.vue'

const route = useRoute()
const tripId = route.params.id

const { getMembersWithAliases, updateMemberAlias, removeTripMember } = useTrips()

const loading = ref(true)
const membersList = ref([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const showRemoveModal = ref(false)
const selectedMember = ref(null)

// Cargar miembros
const loadData = async () => {
  loading.value = true
  try {
    membersList.value = await getMembersWithAliases(tripId)
  } catch (error) {
    alert('Error cargando miembros')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// Abrir modal editar
const openEditModal = (member) => {
  selectedMember.value = member
  showEditModal.value = true
}

// Cerrar modal editar
const closeEditModal = () => {
  showEditModal.value = false
  selectedMember.value = null
}

// Guardar alias
const handleSaveAlias = async (newAlias) => {
  try {
    await updateMemberAlias(tripId, selectedMember.value.email, newAlias)
    
    // Actualizar localmente
    const member = membersList.value.find(m => m.email === selectedMember.value.email)
    if (member) member.alias = newAlias
    
    closeEditModal()
  } catch (error) {
    alert('Error al actualizar alias')
  }
}

// Abrir modal eliminar
const openRemoveModal = (member) => {
  selectedMember.value = member
  showRemoveModal.value = true
}

// Cerrar modal eliminar
const closeRemoveModal = () => {
  showRemoveModal.value = false
  selectedMember.value = null
}

// Eliminar miembro
const handleRemoveMember = async () => {
  try {
    await removeTripMember(tripId, selectedMember.value.email)
    await loadData()
    closeRemoveModal()
  } catch (error) {
    alert('Error al eliminar miembro')
    closeRemoveModal()
  }
}

onMounted(loadData)
</script>
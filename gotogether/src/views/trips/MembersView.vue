<!-- views/trips/MembersView.vue -->
<template>
  <div class="container mx-auto p-4 max-w-4xl">
    <h1 class="text-2xl font-bold text-gray-800 mb-4">Integrantes</h1>

    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
      <p class="mt-3 text-gray-600">Cargando...</p>
    </div>

    <div v-else>
      <button @click="showAddModal = true" class="btn-primary mb-6">
        + Agregar integrante
      </button>

      <MembersList
        :members="membersList"
        @edit-member="openEditModal"
        @remove-member="openRemoveModal"
      />
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
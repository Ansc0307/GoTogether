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
        @remove-member="removeMember"
        @update-alias="updateAlias"
      />
    </div>

    <AddMemberModal
      v-if="showAddModal"
      :trip-id="tripId"
      @members-added="loadData"
      @close="showAddModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTrips } from '@/composables/useTrips'
import MembersList from '@/components/trips/MembersList.vue'
import AddMemberModal from '@/components/trips/AddMemberModal.vue'

const route = useRoute()
const tripId = route.params.id

const { getMembersWithAliases, removeTripMember, updateMemberAlias } = useTrips()

const loading = ref(true)
const membersList = ref([])
const showAddModal = ref(false)

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

// Eliminar miembro
const removeMember = async (email) => {
  if (!confirm(`¿Eliminar a ${email} del viaje?`)) return

  try {
    await removeTripMember(tripId, email)
    await loadData()
    alert('Miembro eliminado')
  } catch (error) {
    alert('Error al eliminar')
  }
}

// Actualizar alias
const updateAlias = async (email, alias) => {
  if (!alias.trim()) {
    alert('El alias no puede estar vacío')
    return
  }

  try {
    await updateMemberAlias(tripId, email, alias)
    // Actualizar localmente
    const member = membersList.value.find(m => m.email === email)
    if (member) member.alias = alias
  } catch (error) {
    alert('Error al actualizar alias')
  }
}

onMounted(loadData)
</script>
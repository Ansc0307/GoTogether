// composables/useMembers.js
import { ref } from 'vue'
import { useTrips } from './useTrips'

export const useMembers = (tripId) => {
  const { 
    addTripMember, 
    removeTripMember, 
    updateMemberAlias,
    getMembersWithAliases 
  } = useTrips()

  const loading = ref(false)
  const error = ref(null)

  // Cargar miembros
  const loadMembers = async () => {
    loading.value = true
    error.value = null
    
    try {
      const members = await getMembersWithAliases(tripId)
      return { success: true, members }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Agregar miembro
  const addMember = async (email, alias = '', sendInvitation = true) => {
    loading.value = true
    error.value = null

    try {
      const result = await addTripMember(tripId, email, alias, sendInvitation)
      return result
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Eliminar miembro
  const removeMember = async (email) => {
    loading.value = true
    error.value = null

    try {
      const result = await removeTripMember(tripId, email)
      return result
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Actualizar alias
  const updateAlias = async (email, alias) => {
    loading.value = true
    error.value = null

    try {
      const result = await updateMemberAlias(tripId, email, alias)
      return result
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    loadMembers,
    addMember,
    removeMember,
    updateAlias
  }
}
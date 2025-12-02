// composables/useTrips.js
import { ref } from 'vue';
import { tripService } from '@/services/tripService';
import { inviteService } from '@/services/inviteService';
import { getAuth } from 'firebase/auth';

export const useTrips = () => {
  // Estados
  const isLoading = ref(false);
  const isSendingInvites = ref(false);
  const error = ref(null);

  // ========== MÉTODO EXISTENTE ==========
  const createTripWithInvitations = async (tripFormData, invitedMembers, aliasMap = {}, selfAlias = '', shouldSendEmails = true) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const userEmail = user?.email;
      const userName = user?.displayName || 'Usuario Explorador';
      
      // Usar selfAlias si existe, sino userName
      const displayName = selfAlias || userName;
      
      // 1. Preparar alias (incluir self alias si existe)
      const finalAliasMap = { ...aliasMap };
      if (selfAlias && userEmail) {
        finalAliasMap[userEmail] = selfAlias;
      }
      
      // 2. Crear viaje en Firestore
      const trip = await tripService.createTrip(
        tripFormData,
        userEmail,
        displayName,
        invitedMembers,
        finalAliasMap
      );
      
      // 3. Preparar datos del viaje para el email
      const tripDataForEmail = {
        description: "", // No hay campo en formulario
        destination: tripFormData.destinoEspecifico || '',
        startDate: tripFormData.fechaInicio,
        endDate: tripFormData.fechaFin,
        budget: tripFormData.presupuesto
      };
      
      // 4. Enviar invitaciones SOLO si shouldSendEmails es true
      if (invitedMembers.length > 0 && shouldSendEmails) {
        isSendingInvites.value = true;
        
        // Enviar en segundo plano
        setTimeout(async () => {
          try {
            const results = await inviteService.sendBulkInvitations(
              invitedMembers,
              trip.id,
              trip.name,
              displayName,
              userEmail,
              aliasMap,
              tripDataForEmail
            );
            
            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;
            
            if (failed > 0) {
              console.warn(`⚠️ ${failed} invitaciones fallaron:`, 
                results.filter(r => !r.success).map(r => r.email));
            }
            
            console.log(`✅ ${successful} invitaciones enviadas`);
          } catch (inviteError) {
            console.warn('Error enviando invitaciones:', inviteError);
          } finally {
            isSendingInvites.value = false;
          }
        }, 500);
      }
      
      return { success: true, trip };
      
    } catch (err) {
      error.value = err.message;
      console.error('Error creando viaje:', err);
      return { success: false, error: err.message };
      
    } finally {
      isLoading.value = false;
    }
  };

  // ========== NUEVOS MÉTODOS ==========

  // Obtener viaje por ID
  const fetchTrip = async (tripId) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const trip = await tripService.getTripById(tripId);
      return { success: true, trip };
    } catch (err) {
      error.value = err.message;
      console.error('Error obteniendo viaje:', err);
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  };

  // Actualizar información del viaje
  const updateTrip = async (tripId, updates) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Validaciones
      if (updates.name && !updates.name.trim()) {
        throw new Error('El nombre del viaje es requerido');
      }
      
      if (updates.startDate && updates.endDate) {
        const start = new Date(updates.startDate);
        const end = new Date(updates.endDate);
        
        if (start > end) {
          throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
        }
        
        // Validar que no sea en el pasado
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (start < today) {
          throw new Error('La fecha de inicio no puede ser en el pasado');
        }
      }
      
      // Validar presupuesto
      if (updates.budget !== undefined && updates.budget !== null) {
        const budgetNum = Number(updates.budget);
        if (isNaN(budgetNum) || budgetNum < 0) {
          throw new Error('El presupuesto debe ser un número válido mayor o igual a 0');
        }
        updates.budget = budgetNum;
      }
      
      const result = await tripService.updateTrip(tripId, updates);
      return { success: true, ...result };
    } catch (err) {
      error.value = err.message;
      console.error('Error actualizando viaje:', err);
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  };

  // Eliminar viaje
  const deleteTrip = async (tripId) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const result = await tripService.deleteTrip(tripId);
      return { success: true, ...result };
    } catch (err) {
      error.value = err.message;
      console.error('Error eliminando viaje:', err);
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  };

  // Agregar miembro al viaje (con invitación opcional)
  const addTripMember = async (tripId, email, alias = '', sendInvitation = true) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Por favor ingresa un correo electrónico válido');
      }
      
      const result = await tripService.addMember(tripId, email, alias);
      
      // Enviar invitación por email si se solicita
      if (sendInvitation) {
        isSendingInvites.value = true;
        
        setTimeout(async () => {
          try {
            const auth = getAuth();
            const user = auth.currentUser;
            
            if (user) {
              const trip = await tripService.getTripById(tripId);
              
              const invitationResult = await inviteService.sendBulkInvitations(
                [email],
                tripId,
                trip.name,
                user.displayName || 'Un usuario',
                user.email,
                { [email]: alias },
                {
                  destination: trip.destination,
                  startDate: trip.startDate,
                  endDate: trip.endDate,
                  budget: trip.budget
                }
              );
              
              console.log(`📧 Invitación enviada a ${email}:`, invitationResult[0].success);
            }
          } catch (inviteError) {
            console.warn('No se pudo enviar invitación por email:', inviteError);
          } finally {
            isSendingInvites.value = false;
          }
        }, 500);
      }
      
      return { success: true, ...result };
    } catch (err) {
      error.value = err.message;
      console.error('Error agregando miembro:', err);
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  };

  // Remover miembro del viaje
  const removeTripMember = async (tripId, email) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Validar que no sea el creador
      const trip = await tripService.getTripById(tripId);
      if (trip.createdBy === email) {
        throw new Error('No puedes remover al creador del viaje');
      }
      
      const result = await tripService.removeMember(tripId, email);
      return { success: true, ...result };
    } catch (err) {
      error.value = err.message;
      console.error('Error removiendo miembro:', err);
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  };

  // Actualizar alias de miembro
  const updateMemberAlias = async (tripId, email, alias) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      if (!alias.trim()) {
        throw new Error('El alias no puede estar vacío');
      }
      
      const result = await tripService.updateMemberAlias(tripId, email, alias.trim());
      return { success: true, ...result };
    } catch (err) {
      error.value = err.message;
      console.error('Error actualizando alias:', err);
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  };

  // Agregar múltiples miembros a la vez
  const addMultipleMembers = async (tripId, members, sendInvitations = true) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const results = [];
      const successes = [];
      const failures = [];
      
      // Procesar miembros uno por uno
      for (const member of members) {
        try {
          const result = await tripService.addMember(tripId, member.email, member.alias);
          results.push({ ...result, email: member.email, alias: member.alias });
          successes.push(member.email);
        } catch (err) {
          console.warn(`Error agregando ${member.email}:`, err.message);
          failures.push({ email: member.email, error: err.message });
        }
      }
      
      // Enviar invitaciones en segundo plano si se solicita
      if (sendInvitations && successes.length > 0) {
        isSendingInvites.value = true;
        
        setTimeout(async () => {
          try {
            const auth = getAuth();
            const user = auth.currentUser;
            
            if (user) {
              const trip = await tripService.getTripById(tripId);
              
              // Preparar mapa de alias
              const aliasMap = {};
              members.forEach(m => {
                if (m.alias) aliasMap[m.email] = m.alias;
              });
              
              await inviteService.sendBulkInvitations(
                successes,
                tripId,
                trip.name,
                user.displayName || 'Un usuario',
                user.email,
                aliasMap,
                {
                  destination: trip.destination,
                  startDate: trip.startDate,
                  endDate: trip.endDate,
                  budget: trip.budget
                }
              );
              
              console.log(`📧 Invitaciones enviadas a ${successes.length} miembros`);
            }
          } catch (inviteError) {
            console.warn('Error enviando invitaciones:', inviteError);
          } finally {
            isSendingInvites.value = false;
          }
        }, 500);
      }
      
      return { 
        success: true, 
        results,
        successes,
        failures,
        summary: {
          total: members.length,
          added: successes.length,
          failed: failures.length
        }
      };
    } catch (err) {
      error.value = err.message;
      console.error('Error agregando múltiples miembros:', err);
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  };

  // Verificar si usuario es miembro del viaje
  const isUserMember = async (tripId) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user || !user.email) return false;
      
      const trip = await tripService.getTripById(tripId);
      return trip.members?.includes(user.email) || false;
    } catch (err) {
      console.error('Error verificando membresía:', err);
      return false;
    }
  };

  // Verificar si usuario es creador/organizador del viaje
  const isUserOrganizer = async (tripId) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user || !user.email) return false;
      
      const trip = await tripService.getTripById(tripId);
      return trip.createdBy === user.email;
    } catch (err) {
      console.error('Error verificando organizador:', err);
      return false;
    }
  };

  // Obtener alias del usuario actual en el viaje
  const getUserAlias = async (tripId) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user || !user.email) return null;
      
      const trip = await tripService.getTripById(tripId);
      return trip.alias?.[user.email] || null;
    } catch (err) {
      console.error('Error obteniendo alias:', err);
      return null;
    }
  };

  // Obtener lista de miembros con alias
  const getMembersWithAliases = async (tripId) => {
    try {
      const trip = await tripService.getTripById(tripId);
      const members = trip.members || [];
      const aliasMap = trip.alias || {};
      
      return members.map(email => ({
        email,
        alias: aliasMap[email] || email.split('@')[0],
        isOrganizer: email === trip.createdBy
      }));
    } catch (err) {
      console.error('Error obteniendo miembros:', err);
      return [];
    }
  };

  // Resetear estados
  const reset = () => {
    isLoading.value = false;
    isSendingInvites.value = false;
    error.value = null;
  };

  // ========== EXPORT ==========
  return {
    // Estado
    isLoading,
    isSendingInvites,
    error,
    
    // Métodos CRUD de viajes
    createTripWithInvitations,
    fetchTrip,
    updateTrip,
    deleteTrip,
    
    // Métodos de gestión de miembros
    addTripMember,
    removeTripMember,
    updateMemberAlias,
    addMultipleMembers,
    
    // Métodos de consulta
    isUserMember,
    isUserOrganizer,
    getUserAlias,
    getMembersWithAliases,
    
    // Utilidades
    reset
  };
};
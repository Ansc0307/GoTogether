import { ref } from 'vue';
import { tripService } from '@/services/tripService';
import { inviteService } from '@/services/inviteService';
import { getAuth } from 'firebase/auth';

export const useTrips = () => {
  const isLoading = ref(false);
  const isSendingInvites = ref(false);
  const error = ref(null);
  
  const createTripWithInvitations = async (tripFormData, invitedMembers, aliasMap = {}, selfAlias = '') => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const userEmail = user?.email;
      const userName = user?.displayName || 'Usuario Explorador';
      
      // 1. Preparar alias (incluir self alias si existe)
      const finalAliasMap = { ...aliasMap };
      if (selfAlias && userEmail) {
        finalAliasMap[userEmail] = selfAlias;
      }
      
      // 2. Crear viaje en Firestore
      const trip = await tripService.createTrip(
        tripFormData,
        userEmail,
        userName,
        invitedMembers,
        finalAliasMap
      );
      
      // 3. Enviar invitaciones (si hay miembros)
      if (invitedMembers.length > 0) {
        isSendingInvites.value = true;
        
        // Enviar en segundo plano
        setTimeout(async () => {
          try {
            const results = await inviteService.sendBulkInvitations(
              invitedMembers,
              trip.id,
              trip.name,
              userName,
              aliasMap
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
  
  const reset = () => {
    isLoading.value = false;
    isSendingInvites.value = false;
    error.value = null;
  };
  
  return {
    // Estado
    isLoading,
    isSendingInvites,
    error,
    
    // Métodos
    createTripWithInvitations,
    reset
  };
};
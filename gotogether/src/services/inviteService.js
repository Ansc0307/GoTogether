import { emailService } from './emailServiceEmailJS';

export const inviteService = {
  async sendBulkInvitations(emails, tripId, tripName, inviterName, inviterEmail, aliasMap = {}, tripData = {}) {
    const promises = emails.map(async (email) => {
      try {
        const inviterAlias = aliasMap[email] || inviterName;
        const result = await emailService.sendTripInvitation(
          email,           // invited_email
          tripName,        // trip_name
          inviterName,     // inviter_name (usa displayName)
          inviterEmail,    // inviter_email (email real del usuario)
          tripId,          // trip_url
          inviterAlias,    // alias para el destinatario específico
          tripData         // datos adicionales del viaje
        );
        
        return {
          email,
          success: result.success,
          error: result.error || null,
          data: result.data
        };
      } catch (error) {
        return {
          email,
          success: false,
          error: error.message
        };
      }
    });
    
    return Promise.all(promises);
  }
};
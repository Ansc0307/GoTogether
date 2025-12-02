// src/services/inviteService.js
import { emailService } from './emailService';

export const inviteService = {
  async sendBulkInvitations(emails, tripId, tripName, inviterName, aliasMap = {}) {
    const promises = emails.map(async (email) => {
      try {
        const inviterAlias = aliasMap[email] || inviterName;
        const result = await emailService.sendTripInvitation(
          email,
          tripName,
          inviterName,
          tripId,
          inviterAlias
        );
        
        return {
          email,
          success: result.success,
          error: result.error || null
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
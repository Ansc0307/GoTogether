// src/services/emailServiceResendSimple.js
class EmailService {
  constructor() {
    // Tu API key de Resend
    this.apiKey = import.meta.env.VITE_RESEND_API_KEY;
    this.fromEmail = 'GoTogether <onboarding@resend.dev>';
    
    // 🔥 ENDPOINT PÚBLICO SIN CORS - NO INSTALAR NADA
    this.proxyUrl = 'https://api.allorigins.win/raw?url=' + 
                   encodeURIComponent('https://api.resend.com/emails');
  }

  async sendEmail(emailData) {
    console.log('📤 Enviando a:', emailData.to);
    
    try {
      const response = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });

      const data = await response.json();
      console.log('📨 Respuesta:', data);
      
      return { 
        success: response.ok, 
        data,
        error: response.ok ? null : data.message
      };

    } catch (error) {
      console.error('❌ Error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendTripInvitation(toEmail, tripName, inviterName, tripId, inviterAlias = '') {
    const displayName = inviterAlias || inviterName;
    const tripUrl = `${window.location.origin}/trips/${tripId}`;
    
    const emailData = {
      from: this.fromEmail,
      to: toEmail,
      subject: `✈️ ${displayName} te invita al viaje: ${tripName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #4F46E5; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">✈️ ¡Invitación de viaje!</h1>
          </div>
          <div style="padding: 20px; background: white;">
            <p>Hola,</p>
            <p><strong>${displayName}</strong> te ha invitado a planificar:</p>
            <div style="background: #f3f4f6; padding: 15px; margin: 15px 0; border-radius: 8px;">
              <h3 style="color: #4F46E5; margin-top: 0;">${tripName}</h3>
              <p>Organiza itinerario, gastos y tareas con tu grupo.</p>
            </div>
            <div style="text-align: center; margin: 25px 0;">
              <a href="${tripUrl}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                🎯 Unirme al viaje
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              Enviado por <strong>GoTogether</strong>
            </p>
          </div>
        </div>
      `,
      text: `${displayName} te invita al viaje "${tripName}"\n\nUnete aquí: ${tripUrl}\n\n--\nGoTogether - Planifica tus viajes en grupo`
    };
    
    return this.sendEmail(emailData);
  }
}

export const emailService = new EmailService();
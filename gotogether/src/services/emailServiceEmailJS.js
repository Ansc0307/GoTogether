import emailjs from '@emailjs/browser';

class EmailService {
  constructor() {
    this.SERVICE_ID = 'service_xs9dhh6';
    this.TEMPLATE_ID = 'template_3qtdpud';
    this.PUBLIC_KEY = '4TBnoXhtUXhqwRKf0';
    
    emailjs.init(this.PUBLIC_KEY);
    console.log('✅ EmailJS inicializado');
  }

  async sendTripInvitation(toEmail, tripName, inviterName, inviterEmail, tripId, inviterAlias = '', tripData = {}) {
    try {
      const displayName = inviterAlias || inviterName;
      const tripUrl = `${window.location.origin}/trips/${tripId}/tareas`;
      
      console.log(`📤 Enviando a: ${toEmail}`);
      console.log('📋 Datos del viaje:', tripData);
      
      // 🔥 CORRECCIÓN: Usar tripData que viene del formulario
      const templateParams = {
        to_email: toEmail,
        invited_email: toEmail,
        inviter_name: inviterName, // Nombre del que invita (selfAlias o userName)
        inviter_email: inviterEmail || 'noreply@gotogether.app', // Email del usuario logueado
        trip_name: tripName,
        trip_description: tripData.description || 'Planifica itinerario, gastos y actividades con tu grupo.',
        trip_destination: tripData.destination || 'Destino por definir',
        start_date: this.formatDate(tripData.startDate) || 'Por definir',
        end_date: this.formatDate(tripData.endDate) || 'Por definir',
        budget: tripData.budget ? `Bs. ${parseFloat(tripData.budget).toLocaleString('es-BO')}` : 'Por definir',
        trip_url: tripUrl
      };

      console.log('📝 Parámetros completos para EmailJS:', templateParams);

      const result = await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        templateParams
      );
      
      console.log('✅ EmailJS éxito:', result.status);
      
      return { 
        success: true, 
        data: result,
        message: `Invitación enviada a ${toEmail}`
      };

    } catch (error) {
      console.error('❌ Error EmailJS:', error);
      return { 
        success: false, 
        error: error.text || error.message,
        email: toEmail
      };
    }
  }

  formatDate(dateString) {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      // Si la fecha es inválida, retornar string original
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.warn('Error formateando fecha:', dateString, error);
      return dateString;
    }
  }
}

export const emailService = new EmailService();
// services/tripService.js
import { db } from '../firebase/firebaseConfig';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  Timestamp 
} from 'firebase/firestore';

export const tripService = {
  // Crear viaje
  async createTrip(tripData, userEmail, userName, members = [], aliasMap = {}) {
    const tripDoc = {
      name: tripData.nombre,
      description: "",
      destination: tripData.destinoEspecifico || "",
      startDate: tripData.fechaInicio,
      endDate: tripData.fechaFin,
      budget: parseFloat(tripData.presupuesto) || 0,
      createdBy: userEmail,
      createdByName: userName,
      members: [userEmail, ...members],
      alias: { ...aliasMap },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const tripRef = await addDoc(collection(db, "trips"), tripDoc);
    return {
      id: tripRef.id,
      ...tripDoc
    };
  },

  // Obtener viaje por ID
  async getTripById(tripId) {
    try {
      const tripRef = doc(db, "trips", tripId);
      const tripSnap = await getDoc(tripRef);
      
      if (!tripSnap.exists()) {
        throw new Error('Viaje no encontrado');
      }
      
      return {
        id: tripSnap.id,
        ...tripSnap.data()
      };
    } catch (error) {
      console.error('Error obteniendo viaje:', error);
      throw error;
    }
  },

  // Actualizar viaje
  async updateTrip(tripId, updates) {
    try {
      const tripRef = doc(db, "trips", tripId);
      
      const validatedUpdates = {
        ...updates,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(tripRef, validatedUpdates);
      return { success: true, tripId };
    } catch (error) {
      console.error('Error actualizando viaje:', error);
      throw error;
    }
  },

  // Eliminar viaje
  async deleteTrip(tripId) {
    try {
      const tripRef = doc(db, "trips", tripId);
      await deleteDoc(tripRef);
      return { success: true, tripId };
    } catch (error) {
      console.error('Error eliminando viaje:', error);
      throw error;
    }
  },

  // Agregar miembro a viaje
  async addMember(tripId, email, alias = '') {
    try {
      const tripRef = doc(db, "trips", tripId);
      const tripSnap = await getDoc(tripRef);
      
      if (!tripSnap.exists()) {
        throw new Error('Viaje no encontrado');
      }
      
      const data = tripSnap.data();
      const currentMembers = data.members || [];
      const currentAlias = data.alias || {};
      
      // Verificar si ya es miembro
      if (currentMembers.includes(email)) {
        throw new Error('El usuario ya es miembro del viaje');
      }
      
      // Actualizar arrays
      const updatedMembers = [...currentMembers, email];
      const updatedAlias = { 
        ...currentAlias, 
        [email]: alias || email.split('@')[0] 
      };
      
      await updateDoc(tripRef, {
        members: updatedMembers,
        alias: updatedAlias,
        updatedAt: Timestamp.now()
      });
      
      return { success: true, email, alias: updatedAlias[email] };
    } catch (error) {
      console.error('Error agregando miembro:', error);
      throw error;
    }
  },

  // Remover miembro de viaje
  async removeMember(tripId, email) {
    try {
      const tripRef = doc(db, "trips", tripId);
      const tripSnap = await getDoc(tripRef);
      
      if (!tripSnap.exists()) {
        throw new Error('Viaje no encontrado');
      }
      
      const data = tripSnap.data();
      const currentMembers = data.members || [];
      const currentAlias = data.alias || {};
      
      // Verificar si es miembro
      if (!currentMembers.includes(email)) {
        throw new Error('El usuario no es miembro del viaje');
      }
      
      // Filtrar el miembro
      const updatedMembers = currentMembers.filter(m => m !== email);
      const updatedAlias = { ...currentAlias };
      delete updatedAlias[email];
      
      await updateDoc(tripRef, {
        members: updatedMembers,
        alias: updatedAlias,
        updatedAt: Timestamp.now()
      });
      
      return { success: true, email };
    } catch (error) {
      console.error('Error removiendo miembro:', error);
      throw error;
    }
  },

  // Actualizar alias de miembro
  async updateMemberAlias(tripId, email, alias) {
    try {
      const tripRef = doc(db, "trips", tripId);
      const tripSnap = await getDoc(tripRef);
      
      if (!tripSnap.exists()) {
        throw new Error('Viaje no encontrado');
      }
      
      const data = tripSnap.data();
      const currentAlias = data.alias || {};
      
      await updateDoc(tripRef, {
        alias: { ...currentAlias, [email]: alias },
        updatedAt: Timestamp.now()
      });
      
      return { success: true, email, alias };
    } catch (error) {
      console.error('Error actualizando alias:', error);
      throw error;
    }
  }
};
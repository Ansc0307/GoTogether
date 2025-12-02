import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export const tripService = {
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
    };

    const tripRef = await addDoc(collection(db, "trips"), tripDoc);
    return {
      id: tripRef.id,
      ...tripDoc
    };
  }
};
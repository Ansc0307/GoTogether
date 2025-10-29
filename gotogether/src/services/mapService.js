import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

// Colección de Firestore
const COLLECTION_NAME = 'mapas';

export class MapService {
  constructor(tripId = 'default-trip') {
    this.tripId = tripId;
  }

  // ========== PUNTOS DE INTERÉS ==========
  
  /**
   * Obtener todos los puntos de interés de un viaje
   * @returns {Promise<Array>} Lista de puntos de interés
   */
  async getPoints() {
    try {
      const pointsQuery = query(
        collection(db, COLLECTION_NAME),
        where('tripId', '==', this.tripId)
      );
      
      const pointsSnapshot = await getDocs(pointsQuery);
      const points = pointsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar por fecha de creación (más reciente primero)
      return points.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date();
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date();
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error getting points:', error);
      return [];
    }
  }

  /**
   * Agregar un nuevo punto de interés
   * @param {Object} point - Datos del punto
   * @param {string} point.name - Nombre del punto
   * @param {string} point.location - Descripción de la ubicación
   * @param {Object} point.coordinates - Coordenadas {lat, lng}
   * @param {string} [point.description] - Descripción opcional
   * @param {string} [point.category] - Categoría (restaurante, hotel, atracción, etc.)
   * @returns {Promise<Object>} El punto creado con su ID
   */
  async addPoint(point) {
    try {
      const newPoint = {
        name: point.name,
        location: point.location,
        coordinates: {
          lat: point.coordinates.lat,
          lng: point.coordinates.lng
        },
        description: point.description || '',
        category: point.category || 'general',
        tripId: this.tripId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), newPoint);
      return { id: docRef.id, ...newPoint };
    } catch (error) {
      console.error('Error adding point:', error);
      throw error;
    }
  }

  /**
   * Actualizar un punto de interés existente
   * @param {string} pointId - ID del punto a actualizar
   * @param {Object} updates - Datos a actualizar
   * @returns {Promise<void>}
   */
  async updatePoint(pointId, updates) {
    try {
      const pointRef = doc(db, COLLECTION_NAME, pointId);
      await updateDoc(pointRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating point:', error);
      throw error;
    }
  }

  /**
   * Eliminar un punto de interés
   * @param {string} pointId - ID del punto a eliminar
   * @returns {Promise<void>}
   */
  async deletePoint(pointId) {
    try {
      const pointRef = doc(db, COLLECTION_NAME, pointId);
      await deleteDoc(pointRef);
    } catch (error) {
      console.error('Error deleting point:', error);
      throw error;
    }
  }

  // ========== LISTENERS EN TIEMPO REAL ==========
  
  /**
   * Escuchar cambios en tiempo real de los puntos de interés
   * @param {Function} callback - Función que se ejecuta cuando hay cambios
   * @returns {Function} Función para desuscribirse
   */
  onPointsChange(callback) {
    const pointsQuery = query(
      collection(db, COLLECTION_NAME),
      where('tripId', '==', this.tripId)
    );
    
    return onSnapshot(pointsQuery, (snapshot) => {
      const points = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar por fecha de creación
      const sortedPoints = points.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date();
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date();
        return dateB - dateA;
      });
      
      callback(sortedPoints);
    });
  }
}

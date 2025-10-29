import { ref, onMounted, onUnmounted } from 'vue';
import { MapService } from '../services/mapService';

export function useMap(tripId = 'default-trip') {
  // Servicio de Firebase
  const mapService = new MapService(tripId);
  
  // Estado reactivo
  const points = ref([]);
  const loading = ref(true);
  const error = ref(null);

  // Listener para desconectar
  let pointsUnsubscribe = null;

  // Métodos para Firebase
  const cargarPuntos = async () => {
    try {
      loading.value = true;
      error.value = null;

      // Cargar puntos iniciales
      const pointsData = await mapService.getPoints();
      points.value = pointsData;

      // Configurar listener en tiempo real
      pointsUnsubscribe = mapService.onPointsChange((newPoints) => {
        points.value = newPoints;
      });

    } catch (err) {
      console.error('Error loading points:', err);
      error.value = 'Error al cargar los puntos de interés';
    } finally {
      loading.value = false;
    }
  };

  const agregarPunto = async (nuevoPunto) => {
    try {
      await mapService.addPoint(nuevoPunto);
      // Los datos se actualizarán automáticamente por el listener
    } catch (err) {
      console.error('Error adding point:', err);
      error.value = 'Error al agregar el punto de interés';
      throw err;
    }
  };

  const editarPunto = async (pointId, datosActualizados) => {
    try {
      await mapService.updatePoint(pointId, datosActualizados);
      // Los datos se actualizarán automáticamente por el listener
    } catch (err) {
      console.error('Error updating point:', err);
      error.value = 'Error al editar el punto de interés';
      throw err;
    }
  };

  const eliminarPunto = async (pointId) => {
    try {
      await mapService.deletePoint(pointId);
      // Los datos se actualizarán automáticamente por el listener
    } catch (err) {
      console.error('Error deleting point:', err);
      error.value = 'Error al eliminar el punto de interés';
      throw err;
    }
  };

  // Lifecycle hooks
  onMounted(() => {
    cargarPuntos();
  });

  onUnmounted(() => {
    // Desconectar listener
    if (pointsUnsubscribe) pointsUnsubscribe();
  });

  return {
    // Estado
    points,
    loading,
    error,
    
    // Métodos
    agregarPunto,
    editarPunto,
    eliminarPunto,
    cargarPuntos
  };
}

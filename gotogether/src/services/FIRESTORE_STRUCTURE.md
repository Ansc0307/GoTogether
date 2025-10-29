# Estructura de Firestore

## Colección: `mapas`

Almacena los puntos de interés de cada viaje.

### Estructura de Documento

```javascript
{
  // Identificación
  id: "auto-generado-por-firestore",
  tripId: "default-trip",  // ID del viaje al que pertenece el punto
  
  // Información básica
  name: "Mirador Killi Killi",  // Nombre del lugar
  location: "La Paz, Bolivia",  // Descripción de la ubicación
  
  // Coordenadas geográficas
  coordinates: {
    lat: -16.5,   // Latitud
    lng: -68.15   // Longitud
  },
  
  // Información adicional
  description: "Mirador con vista panorámica de La Paz",  // Descripción opcional
  category: "atraccion",  // Categoría del punto
  
  // Metadatos
  createdAt: Timestamp,  // Fecha de creación
  updatedAt: Timestamp   // Fecha de última actualización
}
```

### Categorías Disponibles

- `general` - General (por defecto)
- `restaurante` - Restaurante
- `hotel` - Hotel
- `atraccion` - Atracción Turística
- `transporte` - Transporte
- `compras` - Compras
- `naturaleza` - Naturaleza
- `cultura` - Cultura

### Índices Necesarios

Para un mejor rendimiento, se recomienda crear los siguientes índices compuestos en Firestore:

1. **Índice por viaje y fecha**:
   - Campo: `tripId` (Ascending)
   - Campo: `createdAt` (Descending)

### Ejemplo de Uso

```javascript
import { MapService } from './mapService';

// Crear instancia del servicio
const mapService = new MapService('viaje-123');

// Agregar un punto
await mapService.addPoint({
  name: 'Mirador Killi Killi',
  location: 'La Paz, Bolivia',
  coordinates: { lat: -16.5, lng: -68.15 },
  description: 'Vista panorámica de la ciudad',
  category: 'atraccion'
});

// Obtener todos los puntos
const points = await mapService.getPoints();

// Escuchar cambios en tiempo real
const unsubscribe = mapService.onPointsChange((points) => {
  console.log('Puntos actualizados:', points);
});

// Actualizar un punto
await mapService.updatePoint('punto-id', {
  description: 'Nueva descripción'
});

// Eliminar un punto
await mapService.deletePoint('punto-id');
```

## Colección: `budgets`

Almacena los presupuestos de cada viaje.

### Estructura de Documento

```javascript
{
  tripId: "default-trip",
  total: 15000,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Colección: `expenses`

Almacena los gastos de cada viaje.

### Estructura de Documento

```javascript
{
  descripcion: "Cena en restaurante",
  monto: 250,
  pagadoPor: {
    id: "member-id",
    name: "Ana"
  },
  participantes: [
    { id: "member-1", name: "Ana" },
    { id: "member-2", name: "Carlos" }
  ],
  tripId: "default-trip",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Colección: `members`

Almacena los miembros de cada viaje.

### Estructura de Documento

```javascript
{
  name: "Ana",
  tripId: "default-trip",
  createdAt: Timestamp
}
```

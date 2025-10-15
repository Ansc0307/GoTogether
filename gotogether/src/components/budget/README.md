# Budget Module

Este módulo maneja toda la funcionalidad relacionada con el presupuesto y gastos del viaje.

## Estructura

```
budget/
├── components/
│   ├── AddCost.vue          # Formulario para agregar gastos
│   ├── BudgetSummary.vue    # Tarjetas de resumen (presupuesto, gastos, saldo)
│   ├── BalanceTable.vue     # Tabla de balances entre participantes
│   ├── ExpenseTable.vue     # Tabla de gastos con acciones
│   ├── LoadingSpinner.vue   # Componente de carga
│   └── index.js             # Exportaciones centralizadas
├── composables/
│   └── useBudget.js         # Lógica de negocio y estado reactivo
└── services/
    └── budgetService.js     # Operaciones con Firebase
```

## Funcionalidades

### ✅ Implementadas
- **CRUD de Gastos**: Crear, leer, actualizar y eliminar gastos
- **Gestión de Presupuesto**: Establecer y actualizar presupuesto total
- **Cálculo de Balances**: Automático entre participantes
- **Tiempo Real**: Sincronización automática con Firebase
- **Estados de Carga**: Indicadores visuales durante operaciones
- **Manejo de Errores**: Feedback al usuario en caso de errores

### 🔄 En Desarrollo
- Modal de edición de gastos
- Filtros y búsqueda en tablas
- Exportar/importar datos
- Notificaciones push

## Uso

### En un componente Vue:
```javascript
import { useBudget } from '@/composables/useBudget';

export default {
  setup() {
    const {
      presupuestoTotal,
      gastos,
      gastosTotales,
      balances,
      loading,
      error,
      agregarGasto,
      eliminarGasto
    } = useBudget('trip-id');

    return {
      presupuestoTotal,
      gastos,
      // ... resto de propiedades
    };
  }
};
```

### Importar componentes:
```javascript
import { BudgetSummary, ExpenseTable } from '@/components/budget';
```

## Estructura de Datos en Firebase

### Colecciones:
- **budgets**: Presupuestos por viaje
- **expenses**: Gastos individuales
- **members**: Miembros del viaje
- **trips**: Información general del viaje

### Ejemplo de documento de gasto:
```javascript
{
  id: "expense-id",
  tripId: "trip-id",
  descripcion: "Cena en La Paz",
  monto: 250,
  pagadoPor: "Ana",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Configuración

El módulo usa Firebase Firestore para persistencia. Asegúrate de que:
1. Firebase esté configurado en `firebase/firebaseConfig.js`
2. Las reglas de Firestore permitan lectura/escritura
3. El usuario esté autenticado (si es requerido)

## Testing

Para probar el módulo:
1. Navega a `/presupuesto`
2. Agrega algunos gastos
3. Verifica que los balances se calculen correctamente
4. Prueba eliminar gastos
5. Verifica sincronización en tiempo real abriendo múltiples pestañas
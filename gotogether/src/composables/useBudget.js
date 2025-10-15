import { ref, computed } from 'vue';

export function useBudget() {
  // Estado reactivo
  const presupuestoTotal = ref(15000);
  const gastos = ref([
    { descripcion: "Alojamiento en La Paz", monto: 3000, pagadoPor: "Ana" },
    { descripcion: "Transporte en Uyuni", monto: 2500, pagadoPor: "Carlos" },
    { descripcion: "Comidas en Cochabamba", monto: 1500, pagadoPor: "Sofia" },
    { descripcion: "Actividades en Santa Cruz", monto: 1500, pagadoPor: "Ana" },
  ]);

  const miembros = ref(["Ana", "Carlos", "Sofia"]);

  // Computed properties
  const gastosTotales = computed(() => {
    return gastos.value.reduce((total, gasto) => total + gasto.monto, 0);
  });

  const saldoRestante = computed(() => {
    return presupuestoTotal.value - gastosTotales.value;
  });

  const balances = computed(() => {
    // Lógica simplificada para calcular balances
    // En una implementación real, esto sería más complejo
    const balancesPorPersona = {};
    
    // Inicializar balances
    miembros.value.forEach(miembro => {
      balancesPorPersona[miembro] = { pagado: 0, debe: 0 };
    });

    // Calcular lo que cada uno pagó
    gastos.value.forEach(gasto => {
      if (balancesPorPersona[gasto.pagadoPor]) {
        balancesPorPersona[gasto.pagadoPor].pagado += gasto.monto;
      }
    });

    // Calcular lo que cada uno debe (dividido equitativamente)
    const gastoPorPersona = gastosTotales.value / miembros.value.length;
    miembros.value.forEach(miembro => {
      balancesPorPersona[miembro].debe = gastoPorPersona;
    });

    // Convertir a formato de tabla
    return miembros.value.map(miembro => {
      const balance = balancesPorPersona[miembro];
      const diferencia = balance.pagado - balance.debe;
      
      return {
        nombre: miembro,
        debe: diferencia < 0 ? Math.abs(diferencia) : '-',
        recibe: diferencia > 0 ? diferencia : '-'
      };
    });
  });

  // Métodos
  const agregarGasto = (nuevoGasto) => {
    gastos.value.push({
      descripcion: nuevoGasto.descripcion,
      monto: nuevoGasto.monto,
      pagadoPor: nuevoGasto.pagadoPor
    });
  };

  const eliminarGasto = (index) => {
    gastos.value.splice(index, 1);
  };

  const editarGasto = (index, gastoEditado) => {
    gastos.value[index] = { ...gastoEditado };
  };

  const actualizarPresupuesto = (nuevoPresupuesto) => {
    presupuestoTotal.value = nuevoPresupuesto;
  };

  return {
    // Estado
    presupuestoTotal,
    gastos,
    miembros,
    
    // Computed
    gastosTotales,
    saldoRestante,
    balances,
    
    // Métodos
    agregarGasto,
    eliminarGasto,
    editarGasto,
    actualizarPresupuesto
  };
}
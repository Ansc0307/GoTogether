import { ref, computed, onMounted, onUnmounted } from 'vue';
import { BudgetService } from '../services/budgetService';

export function useBudget(tripId = 'default-trip') {
  // Servicio de Firebase
  const budgetService = new BudgetService(tripId);
  
  // Estado reactivo
  const presupuestoTotal = ref(0);
  const gastos = ref([]);
  const miembros = ref([]);
  const loading = ref(true);
  const error = ref(null);

  // Listeners para desconectar
  let expensesUnsubscribe = null;
  let budgetUnsubscribe = null;

  // Computed properties
  const gastosTotales = computed(() => {
    return gastos.value.reduce((total, gasto) => total + gasto.monto, 0);
  });

  const saldoRestante = computed(() => {
    return presupuestoTotal.value - gastosTotales.value;
  });

  const balances = computed(() => {
    if (miembros.value.length === 0 || gastos.value.length === 0) {
      return [];
    }

    const balancesPorPersona = {};
    
    // Inicializar balances para todos los miembros
    miembros.value.forEach(miembro => {
      balancesPorPersona[miembro.name] = { pagado: 0, debe: 0 };
    });

    // Calcular lo que cada uno pagó
    gastos.value.forEach(gasto => {
      const pagadorName = typeof gasto.pagadoPor === 'string' ? gasto.pagadoPor : gasto.pagadoPor.name;
      if (balancesPorPersona[pagadorName]) {
        balancesPorPersona[pagadorName].pagado += gasto.monto;
      }
    });

    // Calcular lo que cada uno debe basado en participación
    gastos.value.forEach(gasto => {
      if (gasto.participantes && gasto.participantes.length > 0) {
        // Usar nueva estructura de participantes
        const montoPorParticipante = gasto.monto / gasto.participantes.length;
        gasto.participantes.forEach(participante => {
          const participanteName = typeof participante === 'string' ? participante : participante.name;
          if (balancesPorPersona[participanteName]) {
            balancesPorPersona[participanteName].debe += montoPorParticipante;
          }
        });
      } else if (gasto.corresponde && Object.keys(gasto.corresponde).length > 0) {
        // Fallback para estructura antigua
        const participantes = Object.entries(gasto.corresponde)
          .filter(([_, participa]) => participa)
          .map(([nombre]) => nombre);
        
        if (participantes.length > 0) {
          const montoPorParticipante = gasto.monto / participantes.length;
          participantes.forEach(participante => {
            if (balancesPorPersona[participante]) {
              balancesPorPersona[participante].debe += montoPorParticipante;
            }
          });
        }
      } else {
        // Fallback: dividir equitativamente entre todos los miembros
        const gastoPorPersona = gasto.monto / miembros.value.length;
        miembros.value.forEach(miembro => {
          balancesPorPersona[miembro.name].debe += gastoPorPersona;
        });
      }
    });

    // Convertir a formato de tabla
    return miembros.value.map(miembro => {
      const balance = balancesPorPersona[miembro.name];
      const diferencia = balance.pagado - balance.debe;
      
      return {
        nombre: miembro.name,
        debe: diferencia < 0 ? Math.abs(diferencia) : '-',
        recibe: diferencia > 0 ? diferencia : '-'
      };
    });
  });

  // Métodos para Firebase
  const cargarDatos = async () => {
    try {
      loading.value = true;
      error.value = null;

      // Cargar datos iniciales
      const [budget, expenses, members] = await Promise.all([
        budgetService.getBudget(),
        budgetService.getExpenses(),
        budgetService.getMembers()
      ]);

      presupuestoTotal.value = budget.total || 0;
      gastos.value = expenses;
      miembros.value = members;

      // Configurar listeners en tiempo real
      expensesUnsubscribe = budgetService.onExpensesChange((newExpenses) => {
        gastos.value = newExpenses;
      });

      budgetUnsubscribe = budgetService.onBudgetChange((newBudget) => {
        presupuestoTotal.value = newBudget.total || 0;
      });

    } catch (err) {
      console.error('Error loading budget data:', err);
      error.value = 'Error al cargar los datos del presupuesto';
    } finally {
      loading.value = false;
    }
  };

  const agregarGasto = async (nuevoGasto) => {
    try {
      // Convertir participantes de objeto corresponde a array de miembros
      const participantes = [];
      if (nuevoGasto.corresponde) {
        Object.entries(nuevoGasto.corresponde).forEach(([memberName, participa]) => {
          if (participa) {
            const miembro = miembros.value.find(m => m.name === memberName);
            if (miembro) {
              participantes.push({
                id: miembro.id,
                name: miembro.name
              });
            }
          }
        });
      }

      await budgetService.addExpense({
        descripcion: nuevoGasto.descripcion,
        monto: nuevoGasto.monto,
        pagadoPor: nuevoGasto.pagadoPor, // Ya debe ser objeto {id, name}
        participantes: participantes
      });
      // Los datos se actualizarán automáticamente por el listener
    } catch (err) {
      console.error('Error adding expense:', err);
      error.value = 'Error al agregar el gasto';
      throw err;
    }
  };

  const eliminarGasto = async (index) => {
    try {
      const gasto = gastos.value[index];
      if (gasto && gasto.id) {
        await budgetService.deleteExpense(gasto.id);
        // Los datos se actualizarán automáticamente por el listener
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
      error.value = 'Error al eliminar el gasto';
      throw err;
    }
  };

  const editarGasto = async (index, gastoEditado) => {
    try {
      const gasto = gastos.value[index];
      if (gasto && gasto.id) {
        await budgetService.updateExpense(gasto.id, gastoEditado);
        // Los datos se actualizarán automáticamente por el listener
      }
    } catch (err) {
      console.error('Error updating expense:', err);
      error.value = 'Error al editar el gasto';
      throw err;
    }
  };

  const actualizarPresupuesto = async (nuevoPresupuesto) => {
    try {
      await budgetService.updateBudget(nuevoPresupuesto);
      // Los datos se actualizarán automáticamente por el listener
    } catch (err) {
      console.error('Error updating budget:', err);
      error.value = 'Error al actualizar el presupuesto';
      throw err;
    }
  };

  const agregarMiembro = async (nombreMiembro) => {
    try {
      const nuevoMiembro = await budgetService.addMember(nombreMiembro);
      miembros.value.push(nuevoMiembro);
    } catch (err) {
      console.error('Error adding member:', err);
      error.value = 'Error al agregar miembro';
      throw err;
    }
  };

  // Lifecycle hooks
  onMounted(() => {
    cargarDatos();
  });

  onUnmounted(() => {
    // Desconectar listeners
    if (expensesUnsubscribe) expensesUnsubscribe();
    if (budgetUnsubscribe) budgetUnsubscribe();
  });

  return {
    // Estado
    presupuestoTotal,
    gastos,
    miembros,
    loading,
    error,
    
    // Computed
    gastosTotales,
    saldoRestante,
    balances,
    
    // Métodos
    agregarGasto,
    eliminarGasto,
    editarGasto,
    actualizarPresupuesto,
    agregarMiembro,
    cargarDatos
  };
}
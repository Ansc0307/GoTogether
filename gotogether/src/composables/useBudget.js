import { ref, computed, onMounted, onUnmounted } from 'vue';
import { BudgetService } from '../services/budgetService';

export function useBudget(tripId = 'default-trip') {
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
  const gastosTotales = computed(() => gastos.value.reduce((total, gasto) => total + gasto.monto, 0));
  const saldoRestante = computed(() => presupuestoTotal.value - gastosTotales.value);

  const balances = computed(() => {
    if (miembros.value.length === 0 || gastos.value.length === 0) return [];

    const balancesPorPersona = {};
    miembros.value.forEach(miembro => {
      balancesPorPersona[miembro.name] = { pagado: 0, debe: 0 };
    });

    gastos.value.forEach(gasto => {
      const pagadorName = typeof gasto.pagadoPor === 'string' ? gasto.pagadoPor : gasto.pagadoPor.name;
      if (balancesPorPersona[pagadorName]) balancesPorPersona[pagadorName].pagado += gasto.monto;
    });

    gastos.value.forEach(gasto => {
      let participantes = [];
      if (gasto.participantes && gasto.participantes.length > 0) {
        participantes = gasto.participantes.map(p => typeof p === 'string' ? p : p.name);
      } else if (gasto.corresponde && Object.keys(gasto.corresponde).length > 0) {
        participantes = Object.entries(gasto.corresponde)
          .filter(([_, participa]) => participa)
          .map(([nombre]) => nombre);
      } else {
        participantes = miembros.value.map(m => m.name);
      }

      const montoPorParticipante = participantes.length > 0 ? gasto.monto / participantes.length : 0;
      participantes.forEach(nombre => {
        if (balancesPorPersona[nombre]) balancesPorPersona[nombre].debe += montoPorParticipante;
      });
    });

    return miembros.value.map(miembro => {
      const balance = balancesPorPersona[miembro.name] || { pagado: 0, debe: 0 };
      const diferencia = (balance.pagado || 0) - (balance.debe || 0);
      return {
        nombre: miembro.displayName || miembro.name,
        debe: diferencia < 0 ? Math.abs(diferencia) : '-',
        recibe: diferencia > 0 ? diferencia : '-'
      };
    });
  });

  // 🔹 Cargar datos iniciales y configurar listeners
  const cargarDatos = async () => {
    try {
      loading.value = true;
      error.value = null;

      const [budget, expenses, members] = await Promise.all([
        budgetService.getBudget(),
        budgetService.getExpenses(),
        budgetService.getMembers() // 🔹 miembros ahora se leen del viaje
      ]);

      presupuestoTotal.value = budget.total || 0;
      gastos.value = expenses;
      miembros.value = members;

      expensesUnsubscribe = budgetService.onExpensesChange(newExpenses => { gastos.value = newExpenses; });
      budgetUnsubscribe = budgetService.onBudgetChange(newBudget => { presupuestoTotal.value = newBudget.total || 0; });

    } catch (err) {
      console.error('Error loading budget data:', err);
      error.value = 'Error al cargar los datos del presupuesto';
    } finally {
      loading.value = false;
    }
  };

  // 🔹 Agregar gasto adaptando participantes a estructura de BudgetService
  const agregarGasto = async (nuevoGasto) => {
    try {
      const participantes = [];
      if (nuevoGasto.corresponde) {
        Object.entries(nuevoGasto.corresponde).forEach(([memberName, participa]) => {
          if (participa) {
            const miembro = miembros.value.find(m => m.name === memberName);
            if (miembro) participantes.push({ id: miembro.id, name: miembro.name, displayName: miembro.displayName });
          }
        });
      }

      await budgetService.addExpense({
        descripcion: nuevoGasto.descripcion,
        monto: nuevoGasto.monto,
        pagadoPor: nuevoGasto.pagadoPor, // debe ser objeto {id, name}
        participantes
      });

    } catch (err) {
      console.error('Error adding expense:', err);
      error.value = 'Error al agregar el gasto';
      throw err;
    }
  };

  // 🔹 Otros métodos mantienen la misma lógica
  const eliminarGasto = async (index) => {
    try {
      const gasto = gastos.value[index];
      if (gasto && gasto.id) await budgetService.deleteExpense(gasto.id);
    } catch (err) { console.error(err); throw err; }
  };

  const editarGasto = async (index, gastoEditado) => {
    try {
      const gasto = gastos.value[index];
      if (gasto && gasto.id) await budgetService.updateExpense(gasto.id, gastoEditado);
    } catch (err) { console.error(err); throw err; }
  };

  const actualizarPresupuesto = async (nuevoPresupuesto) => {
    try { await budgetService.updateBudget(nuevoPresupuesto); } catch (err) { console.error(err); throw err; }
  };

  const agregarMiembro = async (nombreMiembro) => {
    try {
      const nuevoMiembro = await budgetService.addMember(nombreMiembro);
      miembros.value.push(nuevoMiembro);
    } catch (err) { console.error(err); throw err; }
  };

  // Lifecycle hooks
  onMounted(cargarDatos);
  onUnmounted(() => { if (expensesUnsubscribe) expensesUnsubscribe(); if (budgetUnsubscribe) budgetUnsubscribe(); });

  return {
    // Estado
    presupuestoTotal, gastos, miembros, loading, error,
    // Computed
    gastosTotales, saldoRestante, balances,
    //Metodos
    agregarGasto, eliminarGasto, editarGasto, actualizarPresupuesto, agregarMiembro, cargarDatos
  };
}

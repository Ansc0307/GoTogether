<template>
  <div class="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden text-black dark:text-white font-display">
    <main class="flex-1 px-40 py-10">
      <div class="layout-content-container flex flex-col max-w-[960px] mx-auto w-full">
        
        <!-- Título y descripción -->
        <div class="flex flex-wrap justify-between items-center gap-3 p-4">
          <div class="flex flex-col gap-2">
            <h1 class="text-3xl font-bold tracking-tight">Presupuesto y Gastos</h1>
            <p class="text-sm text-black/60 dark:text-white/60">
              Gestiona los gastos del viaje y mantén el presupuesto bajo control.
            </p>
          </div>
        </div>

        <!-- Tarjetas resumen -->
        <BudgetSummary 
          :presupuesto-total="presupuestoTotal"
          :gastos-totales="gastosTotales"
        />

        <!-- Balances -->
        <div class="px-4 pt-8 pb-4">
          <h2 class="text-xl font-bold tracking-tight">Balances</h2>
        </div>
        <BalanceTable :balances="balances" />

        <!-- Gastos -->
        <div class="px-4 pt-8 pb-4">
          <h2 class="text-xl font-bold tracking-tight">Gastos</h2>
        </div>
        <ExpenseTable 
          :gastos="gastos"
          @edit-expense="editarGasto"
          @delete-expense="eliminarGasto"
        />

        <!-- Botón -->
        <div class="flex px-4 py-6 justify-end">
          <button
            @click="irARegistrarGasto"
            class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em]"
          >
            <span class="truncate">+ Registrar Gasto</span>
          </button>
        </div>

      </div>
    </main>
  </div>
</template>

<script>
import { BudgetSummary, BalanceTable, ExpenseTable } from '../components/budget';
import { useBudget } from '../composables/useBudget';

export default {
  name: "Presupuesto",
  components: {
    BudgetSummary,
    BalanceTable,
    ExpenseTable
  },
  setup() {
    const {
      presupuestoTotal,
      gastos,
      gastosTotales,
      balances,
      eliminarGasto: eliminarGastoComposable,
      editarGasto: editarGastoComposable
    } = useBudget();

    return {
      presupuestoTotal,
      gastos,
      gastosTotales,
      balances,
      eliminarGastoComposable,
      editarGastoComposable
    };
  },
  methods: {
    irARegistrarGasto() {
      this.$router.push('/presupuesto/agregar-gasto');
    },
    eliminarGasto(index) {
      if (confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
        this.eliminarGastoComposable(index);
      }
    },
    editarGasto(index) {
      // Por ahora solo mostrar alerta, después se puede implementar modal de edición
      alert(`Editar gasto: ${this.gastos[index].descripcion}`);
    }
  }
};
</script>

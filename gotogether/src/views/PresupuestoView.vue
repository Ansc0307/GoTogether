<!-- /views/PresupuestoView.vue -->
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

        <!-- Estado de carga -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span class="ml-3 text-lg">Cargando datos...</span>
        </div>

        <!-- Error -->
        <div v-if="error" class="mx-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 rounded-lg">
          <p class="text-red-700 dark:text-red-400">{{ error }}</p>
        </div>

        <!-- Contenido principal (solo mostrar si no está cargando) -->
        <div v-if="!loading">
          <!-- Tarjetas resumen -->
          <BudgetSummary 
            :presupuesto-total="presupuestoTotal"
            :gastos-totales="gastosTotales"
            @edit-budget="abrirEditarPresupuesto"
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
            @edit-expense="abrirEditarGasto"
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

      </div>
    </main>

    <!-- Modales -->
    <EditBudget
      :show-modal="showEditBudget"
      :current-budget="presupuestoTotal"
      @close="showEditBudget = false"
      @save="guardarPresupuesto"
    />

    <EditExpense
      :show-modal="showEditExpense"
      :expense="expenseToEdit"
      :miembros="miembros"
      @close="cerrarEditarGasto"
      @save="guardarGastoEditado"
    />
  </div>
</template>

<script>
import { BudgetSummary, BalanceTable, ExpenseTable, EditBudget, EditExpense } from '../components/budget';
import { useBudget } from '../composables/useBudget';
import { useRoute } from 'vue-router';

export default {
  name: "Presupuesto",
  components: {
    BudgetSummary,
    BalanceTable,
    ExpenseTable,
    EditBudget,
    EditExpense
  },
  setup() {
    const route = useRoute();
    const tripId = route.params.id; // <-- ✅ Obtener el ID del viaje actual

    const {
      presupuestoTotal,
      gastos,
      gastosTotales,
      balances,
      loading,
      error,
      miembros,
      eliminarGasto: eliminarGastoComposable,
      editarGasto: editarGastoComposable,
      actualizarPresupuesto
    } = useBudget(tripId); // para pasar tripId dinámico

    return {
      presupuestoTotal,
      gastos,
      gastosTotales,
      balances,
      loading,
      error,
      miembros,
      eliminarGastoComposable,
      editarGastoComposable,
      actualizarPresupuesto,
      tripId 
    };
  },
  data() {
    return {
      showEditBudget: false,
      showEditExpense: false,
      expenseToEdit: null,
      expenseIndexToEdit: -1
    };
  },
  methods: {
    irARegistrarGasto() {
      this.$router.push(`/trips/${this.tripId}/presupuesto/agregar-gasto`);
    },
    async eliminarGasto(index) {
      if (confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
        try {
          await this.eliminarGastoComposable(index);
        } catch (error) {
          alert('Error al eliminar el gasto. Inténtalo de nuevo.');
        }
      }
    },
    abrirEditarPresupuesto() {
      this.showEditBudget = true;
    },
    async guardarPresupuesto(nuevoPresupuesto) {
      try {
        await this.actualizarPresupuesto(nuevoPresupuesto);
        this.showEditBudget = false;
      } catch (error) {
        alert('Error al actualizar el presupuesto');
        throw error;
      }
    },
    abrirEditarGasto(index) {
      this.expenseToEdit = { ...this.gastos[index] };
      this.expenseIndexToEdit = index;
      this.showEditExpense = true;
    },
    async guardarGastoEditado(gastoEditado) {
      try {
        await this.editarGastoComposable(this.expenseIndexToEdit, gastoEditado);
        this.cerrarEditarGasto();
      } catch (error) {
        alert('Error al editar el gasto');
        throw error;
      }
    },
    cerrarEditarGasto() {
      this.showEditExpense = false;
      this.expenseToEdit = null;
      this.expenseIndexToEdit = -1;
    }
  }
};
</script>

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
            :miembros="miembros"
            @edit-expense="abrirEditarGasto"
            @delete-expense="eliminarGasto"
          />

          <!-- Botón -->
          <div class="flex px-4 py-6 justify-end">
            <div class="flex gap-3">
              <button
                @click="showExportModal = true"
                class="flex items-center justify-center rounded-lg h-10 px-4 bg-subtle-light dark:bg-subtle-dark text-sm font-bold text-foreground-light dark:text-foreground-dark hover:bg-subtle-light/90"
                title="Exportar presupuesto y gastos a CSV"
              >
                Exportar CSV
              </button>
              <button
                @click="irARegistrarGasto"
                class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em]"
              >
                <span class="truncate">+ Registrar Gasto</span>
              </button>
            </div>
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

    <!-- Export modal -->
    <div v-if="showExportModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="bg-background-light dark:bg-background-dark rounded-lg p-6 w-full max-w-lg mx-4">
        <h3 class="text-lg font-bold mb-4">Exportar presupuesto a CSV</h3>

        <div class="space-y-4">
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="exportOptions.includeSummary" />
            <span>Incluir resumen</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="exportOptions.includeBalances" />
            <span>Incluir balances</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="exportOptions.includeExpenses" />
            <span>Incluir gastos</span>
          </label>

          <div v-if="exportOptions.includeExpenses" class="pl-4 border-l border-subtle-light dark:border-subtle-dark">
            <p class="font-medium">Columnas de gastos</p>
            <div class="grid grid-cols-2 gap-2 mt-2">
              <label class="flex items-center gap-2"><input type="checkbox" v-model="exportOptions.expenseColumns.descripcion" /> Descripción</label>
              <label class="flex items-center gap-2"><input type="checkbox" v-model="exportOptions.expenseColumns.monto" /> Monto</label>
              <label class="flex items-center gap-2"><input type="checkbox" v-model="exportOptions.expenseColumns.pagadoPor" /> Pagado por</label>
              <label class="flex items-center gap-2"><input type="checkbox" v-model="exportOptions.expenseColumns.fecha" /> Fecha</label>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-2">
              <div>
                <label class="block text-sm">Desde</label>
                <input type="date" v-model="exportOptions.dateFrom" class="w-full border rounded p-2" />
              </div>
              <div>
                <label class="block text-sm">Hasta</label>
                <input type="date" v-model="exportOptions.dateTo" class="w-full border rounded p-2" />
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button @click="showExportModal = false" class="px-4 py-2 rounded bg-subtle-light dark:bg-subtle-dark">Cancelar</button>
          <button @click="confirmExport" class="px-4 py-2 rounded bg-primary text-white">Exportar</button>
        </div>
      </div>
    </div>
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
      expenseIndexToEdit: -1,
      // export modal state & options
      showExportModal: false,
      exportOptions: {
        includeSummary: true,
        includeBalances: true,
        includeExpenses: true,
        expenseColumns: {
          descripcion: true,
          monto: true,
          pagadoPor: true,
          fecha: true
        },
        dateFrom: null,
        dateTo: null
      }
    };
  },
  methods: {
    irARegistrarGasto() {
      this.$router.push(`/trips/${this.tripId}/presupuesto/agregar-gasto`);
    },
    exportCSV(options) {
      options = options || this.exportOptions || {};
      const escape = (v) => {
        if (v === null || v === undefined) return '""';
        const s = String(v);
        return '"' + s.replace(/"/g, '""') + '"';
      };

      const parts = [];

      // Helper to get date of an expense as JS Date (or null)
      const getDateFromGasto = (g) => {
        if (!g) return null;
        if (g.createdAt && g.createdAt.seconds) return new Date(g.createdAt.seconds * 1000);
        if (g.createdAt instanceof Date) return g.createdAt;
        if (g.fecha) {
          const d = new Date(g.fecha);
          if (!isNaN(d)) return d;
        }
        return null;
      };

      // Filter expenses by date range if provided
      let gastosFiltered = (this.gastos || []).slice();
      if (options.dateFrom) {
        const from = new Date(options.dateFrom);
        gastosFiltered = gastosFiltered.filter(g => {
          const d = getDateFromGasto(g);
          return d ? d >= from : true;
        });
      }
      if (options.dateTo) {
        const to = new Date(options.dateTo);
        // include whole day
        to.setHours(23,59,59,999);
        gastosFiltered = gastosFiltered.filter(g => {
          const d = getDateFromGasto(g);
          return d ? d <= to : true;
        });
      }

      // Resumen
      if (options.includeSummary) {
        parts.push('Resumen');
        parts.push('Tipo,Valor');
        parts.push(`${escape('Presupuesto Total')},${escape(this.presupuestoTotal)}`);
        parts.push(`${escape('Gastos Totales')},${escape(this.gastosTotales)}`);
        const saldo = (this.presupuestoTotal || 0) - (this.gastosTotales || 0);
        parts.push(`${escape('Saldo Restante')},${escape(saldo)}`);
        parts.push('');
      }

      // Balances
      if (options.includeBalances) {
        parts.push('Balances');
        parts.push('Participante,Debe,Recibe');
        (this.balances || []).forEach(b => {
          parts.push(`${escape(b.nombre)},${escape(typeof b.debe === 'number' ? b.debe : b.debe)},${escape(typeof b.recibe === 'number' ? b.recibe : b.recibe)}`);
        });
        parts.push('');
      }

      // Gastos
      if (options.includeExpenses) {
        // build header from selected columns
        const cols = [];
        if (options.expenseColumns.descripcion) cols.push('Descripción');
        if (options.expenseColumns.monto) cols.push('Monto');
        if (options.expenseColumns.pagadoPor) cols.push('Pagado por');
        if (options.expenseColumns.fecha) cols.push('Fecha');

        parts.push('Gastos');
        parts.push(cols.join(','));

        gastosFiltered.forEach(g => {
          const row = [];
          if (options.expenseColumns.descripcion) row.push(escape(g.descripcion || ''));
          if (options.expenseColumns.monto) row.push(escape(g.monto || ''));
          if (options.expenseColumns.pagadoPor) {
            let paidBy = '';
            if (typeof g.pagadoPor === 'string') {
              const m = (this.miembros || []).find(x => x.id === g.pagadoPor || x.name === g.pagadoPor);
              paidBy = (m && (m.displayName || m.name)) || g.pagadoPor;
            } else if (g.pagadoPor && (g.pagadoPor.displayName || g.pagadoPor.name)) {
              paidBy = g.pagadoPor.displayName || g.pagadoPor.name;
            }
            row.push(escape(paidBy));
          }
          if (options.expenseColumns.fecha) {
            const d = getDateFromGasto(g);
            row.push(escape(d ? d.toLocaleDateString('es-ES') : ''));
          }
          parts.push(row.join(','));
        });
      }

      const csv = parts.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presupuesto_${this.tripId || 'trip'}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
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
    ,
    confirmExport() {
      // call export with current options then close modal
      try {
        this.exportCSV(this.exportOptions);
      } finally {
        this.showExportModal = false;
      }
    }
  }
};
</script>

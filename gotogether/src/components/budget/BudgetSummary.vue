<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
    <div class="flex flex-col gap-2 rounded-lg p-6 bg-primary/10 dark:bg-primary/20 relative group">
      <div class="flex justify-between items-start">
        <p class="text-base font-medium">Presupuesto Total</p>
        <button
          @click="$emit('edit-budget')"
          class="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-primary/20"
          title="Editar presupuesto"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
        </button>
      </div>
      <p class="text-2xl font-bold tracking-tight">Bs {{ formatCurrency(presupuestoTotal) }}</p>
    </div>
    <div class="flex flex-col gap-2 rounded-lg p-6 bg-primary/10 dark:bg-primary/20">
      <p class="text-base font-medium">Gastos Totales</p>
      <p class="text-2xl font-bold tracking-tight">Bs {{ formatCurrency(gastosTotales) }}</p>
    </div>
    <div class="flex flex-col gap-2 rounded-lg p-6 bg-primary/10 dark:bg-primary/20">
      <p class="text-base font-medium">Saldo Restante</p>
      <p class="text-2xl font-bold tracking-tight" :class="saldoRestante >= 0 ? 'text-green-600' : 'text-red-600'">
        Bs {{ formatCurrency(saldoRestante) }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BudgetSummary',
  props: {
    presupuestoTotal: {
      type: Number,
      default: 0
    },
    gastosTotales: {
      type: Number,
      default: 0
    }
  },
  emits: ['edit-budget'],
  computed: {
    saldoRestante() {
      return this.presupuestoTotal - this.gastosTotales;
    }
  },
  methods: {
    formatCurrency(amount) {
      return new Intl.NumberFormat('es-BO').format(amount);
    }
  }
};
</script>
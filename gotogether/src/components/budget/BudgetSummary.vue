<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
    <div class="flex flex-col gap-2 rounded-lg p-6 bg-primary/10 dark:bg-primary/20">
      <p class="text-base font-medium">Presupuesto Total</p>
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
<!--/components/budget/ExpenceTable.vue-->
<template>
  <div class="px-4 py-3">
    <!-- Table desktop -->
    <div class="hidden md:block overflow-hidden rounded-lg border border-primary/20 dark:border-primary/30">
      <table class="w-full text-left">
        <thead class="bg-background-light dark:bg-primary/20">
          <tr>
            <th class="px-6 py-3 text-sm font-medium">Descripción</th>
            <th class="px-6 py-3 text-sm font-medium">Monto</th>
            <th class="px-6 py-3 text-sm font-medium">Pagado por</th>
            <th class="px-6 py-3 text-sm font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-primary/20 dark:divide-primary/30">
          <tr v-for="(gasto, index) in gastos" :key="index">
            <td class="h-[64px] px-6 py-2 text-sm">{{ gasto.descripcion }}</td>
            <td class="h-[64px] px-6 py-2 text-sm text-black/60 dark:text-white/60">
              Bs {{ formatCurrency(gasto.monto) }}
            </td>
            <td class="h-[64px] px-6 py-2 text-sm text-black/60 dark:text-white/60">
              <span v-if="typeof gasto.pagadoPor === 'string'">
                {{ (miembros.find(m => m.id === gasto.pagadoPor || m.name === gasto.pagadoPor) || {}).displayName || gasto.pagadoPor }}
              </span>
              <span v-else>
                {{ gasto.pagadoPor.displayName || gasto.pagadoPor.name }}
              </span>
            </td>
            <td class="h-[64px] px-6 py-2 text-sm">
              <button 
                @click="$emit('edit-expense', index)"
                class="text-primary hover:text-primary/80 mr-3"
              >
                Editar
              </button>
              <button 
                @click="$emit('delete-expense', index)"
                class="text-red-600 hover:text-red-800"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Cards mobile -->
    <div class="md:hidden space-y-3">
      <div v-for="(gasto, index) in gastos" :key="index" class="rounded-lg border border-primary/10 dark:border-primary/20 p-3 bg-background-light dark:bg-background-dark">
        <div class="flex justify-between items-start gap-3">
          <div class="flex-1">
            <div class="text-sm font-medium">{{ gasto.descripcion }}</div>
            <div class="text-xs text-muted-light dark:text-muted-dark mt-1">{{ (typeof gasto.monto === 'number') ? `Bs ${formatCurrency(gasto.monto)}` : gasto.monto }}</div>
            <div class="text-xs text-muted-light dark:text-muted-dark mt-2">
              Pagado por: <span class="font-medium"> 
                <span v-if="typeof gasto.pagadoPor === 'string'">{{ (miembros.find(m => m.id === gasto.pagadoPor || m.name === gasto.pagadoPor) || {}).displayName || gasto.pagadoPor }}</span>
                <span v-else>{{ gasto.pagadoPor.displayName || gasto.pagadoPor.name }}</span>
              </span>
            </div>
          </div>
          <div class="flex flex-col items-end gap-2">
            <button @click="$emit('edit-expense', index)" class="text-primary text-sm">Editar</button>
            <button @click="$emit('delete-expense', index)" class="text-red-600 text-sm">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExpenseTable',
  props: {
    gastos: {
      type: Array,
      default: () => []
    },
    miembros: {
      type: Array,
      default: () => []
    }
  },
  emits: ['edit-expense', 'delete-expense'],
  methods: {
    formatCurrency(amount) {
      if (typeof amount === 'string') {
        // Remove 'Bs ' and commas, then parse
        const numericAmount = parseFloat(amount.replace(/[Bs\s,]/g, ''));
        return new Intl.NumberFormat('es-BO').format(numericAmount);
      }
      return new Intl.NumberFormat('es-BO').format(amount);
    }
  }
};
</script>
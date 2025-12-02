<!--/components/budget/BalanceTable.vue-->
<template>
  <div class="px-4 py-3">
    <!-- Table for md+ -->
    <div class="hidden md:block overflow-hidden rounded-lg border border-primary/20 dark:border-primary/30">
      <table class="w-full text-left">
        <thead class="bg-background-light dark:bg-primary/20">
          <tr>
            <th class="px-6 py-3 text-sm font-medium">Participante</th>
            <th class="px-6 py-3 text-sm font-medium">Debe</th>
            <th class="px-6 py-3 text-sm font-medium">Recibe</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-primary/20 dark:divide-primary/30">
          <tr v-for="(balance, index) in balances" :key="index">
            <td class="h-[64px] px-6 py-2 text-sm">{{ balance.nombre }}</td>
            <td class="h-[64px] px-6 py-2 text-sm text-black/60 dark:text-white/60">
              {{ balance.debe !== '-' ? `Bs ${formatCurrency(balance.debe)}` : '-' }}
            </td>
            <td class="h-[64px] px-6 py-2 text-sm text-black/60 dark:text-white/60">
              {{ balance.recibe !== '-' ? `Bs ${formatCurrency(balance.recibe)}` : '-' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Cards for mobile -->
    <div class="md:hidden space-y-3">
      <div v-for="(balance, index) in balances" :key="index" class="rounded-lg border border-primary/10 dark:border-primary/20 p-3 bg-background-light dark:bg-background-dark">
        <div class="flex items-center justify-between">
          <div class="text-sm font-medium">{{ balance.nombre }}</div>
        </div>
        <div class="mt-2 grid grid-cols-2 gap-2 text-sm text-black/60 dark:text-white/60">
          <div>
            <div class="text-xs text-muted-light dark:text-muted-dark">Debe</div>
            <div class="font-medium">{{ balance.debe !== '-' ? `Bs ${formatCurrency(balance.debe)}` : '-' }}</div>
          </div>
          <div>
            <div class="text-xs text-muted-light dark:text-muted-dark">Recibe</div>
            <div class="font-medium">{{ balance.recibe !== '-' ? `Bs ${formatCurrency(balance.recibe)}` : '-' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BalanceTable',
  props: {
    balances: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    formatCurrency(amount) {
      if (typeof amount === 'string') return amount;
      return new Intl.NumberFormat('es-BO').format(amount);
    }
  }
};
</script>
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
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          <div class="flex flex-col gap-2 rounded-lg p-6 bg-primary/10 dark:bg-primary/20">
            <p class="text-base font-medium">Presupuesto Total</p>
            <p class="text-2xl font-bold tracking-tight">Bs 15,000</p>
          </div>
          <div class="flex flex-col gap-2 rounded-lg p-6 bg-primary/10 dark:bg-primary/20">
            <p class="text-base font-medium">Gastos Totales</p>
            <p class="text-2xl font-bold tracking-tight">Bs 8,500</p>
          </div>
          <div class="flex flex-col gap-2 rounded-lg p-6 bg-primary/10 dark:bg-primary/20">
            <p class="text-base font-medium">Saldo Restante</p>
            <p class="text-2xl font-bold tracking-tight">Bs 6,500</p>
          </div>
        </div>

        <!-- Balances -->
        <div class="px-4 pt-8 pb-4">
          <h2 class="text-xl font-bold tracking-tight">Balances</h2>
        </div>
        <div class="px-4 py-3">
          <div class="overflow-hidden rounded-lg border border-primary/20 dark:border-primary/30">
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
                  <td class="h-[64px] px-6 py-2 text-sm text-black/60 dark:text-white/60">{{ balance.debe }}</td>
                  <td class="h-[64px] px-6 py-2 text-sm text-black/60 dark:text-white/60">{{ balance.recibe }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Gastos -->
        <div class="px-4 pt-8 pb-4">
          <h2 class="text-xl font-bold tracking-tight">Gastos</h2>
        </div>
        <div class="px-4 py-3">
          <div class="overflow-hidden rounded-lg border border-primary/20 dark:border-primary/30">
            <table class="w-full text-left">
              <thead class="bg-background-light dark:bg-primary/20">
                <tr>
                  <th class="px-6 py-3 text-sm font-medium">Descripción</th>
                  <th class="px-6 py-3 text-sm font-medium">Monto</th>
                  <th class="px-6 py-3 text-sm font-medium">Pagado por</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-primary/20 dark:divide-primary/30">
                <tr v-for="(gasto, index) in gastos" :key="index">
                  <td class="h-[64px] px-6 py-2 text-sm">{{ gasto.descripcion }}</td>
                  <td class="h-[64px] px-6 py-2 text-sm text-black/60 dark:text-white/60">{{ gasto.monto }}</td>
                  <td class="h-[64px] px-6 py-2 text-sm text-black/60 dark:text-white/60">{{ gasto.pagadoPor }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

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
export default {
  name: "Presupuesto",
  data() {
    return {
      balances: [
        { nombre: "Ana", debe: "Bs 500", recibe: "-" },
        { nombre: "Carlos", debe: "-", recibe: "Bs 300" },
        { nombre: "Sofia", debe: "Bs 200", recibe: "-" },
      ],
      gastos: [
        { descripcion: "Alojamiento en La Paz", monto: "Bs 3,000", pagadoPor: "Ana" },
        { descripcion: "Transporte en Uyuni", monto: "Bs 2,500", pagadoPor: "Carlos" },
        { descripcion: "Comidas en Cochabamba", monto: "Bs 1,500", pagadoPor: "Sofia" },
        { descripcion: "Actividades en Santa Cruz", monto: "Bs 1,500", pagadoPor: "Ana" },
      ],
    };
  },
  methods: {
    irARegistrarGasto() {
      this.$router.push('/presupuesto/agregar-gasto');
    }
  }
};
</script>

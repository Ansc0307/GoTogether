<!--/components/budget/AddCost.vue-->
<template>
  <div class="flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display">
    <main class="flex flex-1 justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div class="w-full max-w-lg space-y-8">
        
        <!-- Título -->
        <div>
          <div class="flex items-center gap-4 mb-4">
            <button 
              @click="volver"
              class="flex items-center justify-center w-10 h-10 rounded-lg bg-subtle-light dark:bg-subtle-dark hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
            >
              <svg class="w-5 h-5 text-foreground-light dark:text-foreground-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <div>
              <h1 class="text-3xl font-bold text-foreground-light dark:text-foreground-dark">Registrar Gasto</h1>
            </div>
          </div>
          <p class="text-muted-light dark:text-muted-dark">
            Añade un nuevo gasto y repártelo entre los miembros del viaje.
          </p>
        </div>

        <!-- Formulario -->
        <form @submit.prevent="guardarGasto" class="space-y-6">
          
          <!-- Descripción -->
          <div>
            <label class="block text-sm font-medium text-foreground-light dark:text-foreground-dark" for="description">
              Descripción
            </label>
            <div class="mt-1">
              <input
                v-model="nuevoGasto.descripcion"
                class="block w-full rounded-lg border-0 bg-subtle-light p-4 text-foreground-light placeholder-muted-light focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-subtle-dark dark:text-foreground-dark dark:placeholder-muted-dark"
                id="description"
                type="text"
                placeholder="Ej. Cena en La Paz"
              />
            </div>
          </div>

          <!-- Monto y Pagado por -->
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-foreground-light dark:text-foreground-dark" for="amount">
                Monto (Bs.)
              </label>
              <div class="mt-1">
                <input
                  v-model.number="nuevoGasto.monto"
                  class="block w-full rounded-lg border-0 bg-subtle-light p-4 text-foreground-light placeholder-muted-light focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-subtle-dark dark:text-foreground-dark dark:placeholder-muted-dark"
                  id="amount"
                  type="number"
                  placeholder="Ej. 250"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground-light dark:text-foreground-dark" for="paid-by">
                ¿Quién pagó?
              </label>
              <div class="mt-1">
                <select
                  v-model="nuevoGasto.pagadoPor"
                  class="block w-full rounded-lg border-0 bg-subtle-light p-4 text-foreground-light focus:ring-2 focus:ring-inset focus:ring-primary dark:bg-subtle-dark dark:text-foreground-dark"
                >
                  <option value="">Seleccionar...</option>
                  <option v-for="miembro in miembros" :key="miembro.id" :value="miembro">{{ miembro.name }}</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Participantes del gasto -->
          <div>
            <h3 class="text-base font-medium text-foreground-light dark:text-foreground-dark">
              ¿A quiénes corresponde pagar?
            </h3>
            <fieldset class="mt-4 space-y-4">
              <div v-for="miembro in miembros" :key="miembro.id" class="relative flex items-start">
                <div class="flex h-6 items-center">
                  <input
                    type="checkbox"
                    class="form-checkbox h-5 w-5 rounded border-muted-light bg-subtle-light text-primary focus:ring-primary dark:border-muted-dark dark:bg-subtle-dark"
                    v-model="nuevoGasto.corresponde[miembro.name]"
                  />
                </div>
                <div class="ml-3 text-sm leading-6">
                  <label class="font-medium text-foreground-light dark:text-foreground-dark">{{ miembro.name }}</label>
                </div>
              </div>
            </fieldset>
          </div>

          <!-- Reparto automático -->
          <div>
            <h3 class="text-base font-medium text-foreground-light dark:text-foreground-dark">Reparto Automático</h3>
            <div class="mt-4 flow-root">
              <div class="-my-4 divide-y divide-subtle-light dark:divide-subtle-dark">
                <div
                  v-for="(monto, miembro) in repartoAutomático"
                  :key="miembro"
                  class="flex items-center justify-between py-4"
                >
                  <p class="text-muted-light dark:text-muted-dark">{{ miembro }} pagará</p>
                  <p class="font-medium text-foreground-light dark:text-foreground-dark">Bs. {{ monto.toFixed(2) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex gap-4">
            <button
              @click="volver"
              type="button"
              class="flex flex-1 justify-center rounded-lg bg-subtle-light dark:bg-subtle-dark px-4 py-3 text-sm font-bold text-foreground-light dark:text-foreground-dark shadow-sm hover:bg-muted-light/20 dark:hover:bg-muted-dark/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Cancelar
            </button>
            <button
              class="flex flex-1 justify-center rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              type="submit"
            >
              Guardar Gasto
            </button>
          </div>

        </form>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useBudget } from '../../composables/useBudget';

export default {
  name: "RegistrarGasto",
  setup() {
    const router = useRouter();
    const { miembros, agregarGasto } = useBudget();
    
    const nuevoGasto = ref({
      descripcion: "",
      monto: 0,
      pagadoPor: "",
      corresponde: {},
    });

    // Inicializar corresponde con todos los miembros seleccionados
    onMounted(() => {
      miembros.value.forEach(miembro => {
        nuevoGasto.value.corresponde[miembro.name] = true;
      });
    });

    const repartoAutomático = computed(() => {
      const seleccionados = Object.entries(nuevoGasto.value.corresponde)
        .filter(([_, v]) => v)
        .map(([k]) => k);
      const count = seleccionados.length;
      const montoPorPersona = count > 0 ? nuevoGasto.value.monto / count : 0;
      const reparto = {};
      seleccionados.forEach(miembro => {
        reparto[miembro] = montoPorPersona;
      });
      return reparto;
    });

    const guardarGasto = () => {
      if (!nuevoGasto.value.descripcion || nuevoGasto.value.monto <= 0 || !nuevoGasto.value.pagadoPor) {
        alert('Por favor completa todos los campos correctamente.');
        return;
      }

      // Verificar que al menos una persona esté seleccionada para pagar
      const participantes = Object.values(nuevoGasto.value.corresponde).some(v => v);
      if (!participantes) {
        alert('Debe seleccionar al menos una persona que participe en el gasto');
        return;
      }

      // Agregar el gasto usando el composable
      agregarGasto({
        descripcion: nuevoGasto.value.descripcion,
        monto: nuevoGasto.value.monto,
        pagadoPor: nuevoGasto.value.pagadoPor, // Ya es objeto {id, name}
        corresponde: nuevoGasto.value.corresponde
      });

      alert(`Gasto de Bs. ${nuevoGasto.value.monto} registrado correctamente.`);
      
      // Reiniciar formulario
      nuevoGasto.value.descripcion = "";
      nuevoGasto.value.monto = 0;
      nuevoGasto.value.pagadoPor = "";
      // Reinicializar corresponde
      nuevoGasto.value.corresponde = {};
      miembros.value.forEach(miembro => {
        nuevoGasto.value.corresponde[miembro.name] = true;
      });
      
      // Volver a la vista de presupuesto después de guardar
      router.push('/presupuesto');
    };

    const volver = () => {
      router.push('/presupuesto');
    };
    
    return {
      miembros,
      nuevoGasto,
      repartoAutomático,
      guardarGasto,
      volver
    };
  }
};
</script>

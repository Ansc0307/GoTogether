<!--/components/budget/EditExpense.vue-->
<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-background-light dark:bg-background-dark rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
      <h3 class="text-lg font-bold text-foreground-light dark:text-foreground-dark mb-4">
        Editar Gasto
      </h3>
      
      <form @submit.prevent="guardar" class="space-y-4">
        <!-- Descripción -->
        <div>
          <label class="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
            Descripción
          </label>
          <input
            v-model="gastoEditado.descripcion"
            type="text"
            class="block w-full rounded-lg border-0 bg-subtle-light dark:bg-subtle-dark p-4 text-foreground-light dark:text-foreground-dark placeholder-muted-light dark:placeholder-muted-dark focus:ring-2 focus:ring-inset focus:ring-primary"
            placeholder="Ej. Cena en La Paz"
            required
          />
        </div>
        
        <!-- Monto y Pagado por -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
              Monto (Bs.)
            </label>
            <input
              v-model.number="gastoEditado.monto"
              type="number"
              min="0"
              step="0.01"
              class="block w-full rounded-lg border-0 bg-subtle-light dark:bg-subtle-dark p-4 text-foreground-light dark:text-foreground-dark placeholder-muted-light dark:placeholder-muted-dark focus:ring-2 focus:ring-inset focus:ring-primary"
              placeholder="Ej. 250"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
              ¿Quién pagó?
            </label>
            <select
              v-model="gastoEditado.pagadoPor"
              class="block w-full rounded-lg border-0 bg-subtle-light dark:bg-subtle-dark p-4 text-foreground-light dark:text-foreground-dark focus:ring-2 focus:ring-inset focus:ring-primary"
              required
            >
              <option value="">Seleccionar...</option>
              <option v-for="miembro in miembros" :key="miembro.id" :value="miembro">
                {{ miembro.displayName || miembro.name }}
              </option>
            </select>
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
                  v-model="gastoEditado.corresponde[miembro.name]"
                />
              </div>
              <div class="ml-3 text-sm leading-6">
                <label class="font-medium text-foreground-light dark:text-foreground-dark">{{ miembro.displayName || miembro.name }}</label>
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
                <p class="text-muted-light dark:text-muted-dark">{{ (miembros.find(m => m.name === miembro) || {}).displayName || miembro }} pagará</p>
                <p class="font-medium text-foreground-light dark:text-foreground-dark">Bs. {{ monto.toFixed(2) }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex gap-3 pt-4">
          <button
            type="button"
            @click="cancelar"
            class="flex-1 px-4 py-2 text-sm font-medium text-foreground-light dark:text-foreground-dark bg-subtle-light dark:bg-subtle-dark rounded-lg hover:bg-muted-light/20 dark:hover:bg-muted-dark/20"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {{ loading ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditExpense',
  props: {
    showModal: {
      type: Boolean,
      default: false
    },
    expense: {
      type: Object,
      default: () => ({})
    },
    miembros: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'save'],
  data() {
    return {
      gastoEditado: {
        descripcion: '',
        monto: 0,
        pagadoPor: '',
        corresponde: {}
      },
      loading: false
    };
  },
  computed: {
    repartoAutomático() {
      const seleccionados = Object.entries(this.gastoEditado.corresponde)
        .filter(([_, v]) => v)
        .map(([k]) => k);
      const count = seleccionados.length;
      const montoPorPersona = count > 0 ? this.gastoEditado.monto / count : 0;
      const reparto = {};
      seleccionados.forEach(miembro => {
        reparto[miembro] = montoPorPersona;
      });
      return reparto;
    }
  },
  watch: {
    showModal(newVal) {
      if (newVal && this.expense) {
        this.gastoEditado = {
          descripcion: this.expense.descripcion || '',
          monto: this.expense.monto || 0,
          pagadoPor: this.expense.pagadoPor || '',
          corresponde: this.expense.corresponde || {}
        };
        
        // Si no hay datos de corresponde, inicializar con todos seleccionados
        if (!this.expense.corresponde || Object.keys(this.expense.corresponde).length === 0) {
          this.inicializarCorresponde();
        }
      }
    }
  },
  methods: {
    inicializarCorresponde() {
      // Incluir todos los miembros por defecto
      this.gastoEditado.corresponde = {};
      this.miembros.forEach(miembro => {
        this.gastoEditado.corresponde[miembro.name] = true;
      });
    },
    async guardar() {
      if (!this.gastoEditado.descripcion || this.gastoEditado.monto <= 0 || !this.gastoEditado.pagadoPor) {
        alert('Por favor completa todos los campos correctamente');
        return;
      }

      // Verificar que al menos una persona esté seleccionada para pagar
      const participantes = Object.values(this.gastoEditado.corresponde).some(v => v);
      if (!participantes) {
        alert('Debe seleccionar al menos una persona que participe en el gasto');
        return;
      }
      
      this.loading = true;
      try {
        await this.$emit('save', this.gastoEditado);
        this.cancelar();
      } catch (error) {
        alert('Error al guardar el gasto');
      } finally {
        this.loading = false;
      }
    },
    cancelar() {
      this.$emit('close');
      this.gastoEditado = {
        descripcion: '',
        monto: 0,
        pagadoPor: '',
        corresponde: {}
      };
    }
  }
};
</script>
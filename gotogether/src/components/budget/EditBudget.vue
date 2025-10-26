<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-background-light dark:bg-background-dark rounded-lg p-6 w-full max-w-md mx-4">
      <h3 class="text-lg font-bold text-foreground-light dark:text-foreground-dark mb-4">
        Editar Presupuesto Total
      </h3>
      
      <form @submit.prevent="guardar">
        <div class="mb-4">
          <label class="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
            Nuevo Presupuesto (Bs.)
          </label>
          <input
            v-model.number="nuevoPresupuesto"
            type="number"
            min="0"
            step="0.01"
            class="block w-full rounded-lg border-0 bg-subtle-light dark:bg-subtle-dark p-4 text-foreground-light dark:text-foreground-dark placeholder-muted-light dark:placeholder-muted-dark focus:ring-2 focus:ring-inset focus:ring-primary"
            placeholder="Ej. 15000"
            required
          />
        </div>
        
        <div class="flex gap-3">
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
            {{ loading ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditBudget',
  props: {
    showModal: {
      type: Boolean,
      default: false
    },
    currentBudget: {
      type: Number,
      default: 0
    }
  },
  emits: ['close', 'save'],
  data() {
    return {
      nuevoPresupuesto: 0,
      loading: false
    };
  },
  watch: {
    showModal(newVal) {
      if (newVal) {
        this.nuevoPresupuesto = this.currentBudget;
      }
    }
  },
  methods: {
    async guardar() {
      if (this.nuevoPresupuesto <= 0) {
        alert('El presupuesto debe ser mayor a 0');
        return;
      }
      
      this.loading = true;
      try {
        await this.$emit('save', this.nuevoPresupuesto);
        this.cancelar();
      } catch (error) {
        alert('Error al guardar el presupuesto');
      } finally {
        this.loading = false;
      }
    },
    cancelar() {
      this.$emit('close');
      this.nuevoPresupuesto = this.currentBudget;
    }
  }
};
</script>
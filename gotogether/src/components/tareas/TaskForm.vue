<!-- components/tareas/TaskForm.vue -->
<template>
  <div v-if="visible" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-2xl relative font-display">
      <!-- Botón cerrar -->
      <button
        @click="$emit('close')"
        class="absolute top-3 right-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-2xl"
      >
        ×
      </button>

      <!-- Encabezado -->
      <div class="mb-6">
        <h2 class="text-3xl font-extrabold text-slate-900 dark:text-white">Nueva tarea</h2>
        <p class="mt-1 text-slate-600 dark:text-slate-400 text-sm">
          Completa los detalles para crear una nueva tarea para tu viaje.
        </p>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="addTask" class="space-y-6">
        <!-- Nombre -->
        <div>
          <label for="task-name" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
          <input
            id="task-name"
            v-model="nombre"
            type="text"
            placeholder="Ej. Reservar alojamiento en La Paz"
            class="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary transition"
          />
        </div>

        <!-- Descripción -->
        <div>
          <label for="task-description" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
          <textarea
            id="task-description"
            v-model="descripcion"
            rows="4"
            placeholder="Añade detalles como fechas, preferencias, presupuesto, etc."
            class="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary transition"
          ></textarea>
        </div>

        <!-- Responsable -->
        <div>
          <label for="responsable" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Asignar al responsable</label>
          <div class="relative">
            <select
              id="responsable"
              v-model="responsable"
              class="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary transition custom-select-arrow"
            >
              <option disabled value="">Selecciona un miembro del grupo</option>
              <option value="Ana C.">Ana C. (Tú)</option>
              <option value="Carlos M.">Carlos M.</option>
              <option value="Sofia R.">Sofia R.</option>
              <option value="Javier L.">Javier L.</option>
            </select>
          </div>
        </div>

        <!-- Botón -->
        <div class="flex justify-end pt-2">
          <button
            type="submit"
            class="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-primary/20"
          >
            Crear tarea
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { db } from "../../firebase/firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";

const props = defineProps({ visible: Boolean });
const emit = defineEmits(["close"]);

const nombre = ref("");
const descripcion = ref("");
const responsable = ref("");

const addTask = async () => {
  if (!nombre.value.trim()) return alert("Falta el nombre de la tarea");
  if (!responsable.value.trim()) return alert("Selecciona un responsable");

  await addDoc(collection(db, "tareas"), {
    nombre: nombre.value,
    descripcion: descripcion.value,
    responsable: responsable.value,
    estado: "pendiente",
    fechaCreacion: Timestamp.now()
  });

  nombre.value = "";
  descripcion.value = "";
  responsable.value = "";
  emit("close");
};
</script>

<style scoped>
.custom-select-arrow {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 1.25em 1.25em;
  appearance: none;
  padding-right: 2.5rem; /* espacio para flecha */
}
</style>

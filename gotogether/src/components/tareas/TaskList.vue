<!-- components/tareas/TaskList.vue -->
<template>
  <div class="max-w-4xl mx-auto mt-8 space-y-12">
    <!-- Pendientes -->
    <div>
      <h3 class="text-xl font-bold text-gray-800 mb-4 border-b-2 border-primary/20 pb-2">
        Pendientes
      </h3>
      <div v-if="pendientes.length === 0" class="text-gray-500">
        No hay tareas pendientes.
      </div>

      <div
        v-for="task in pendientes"
        :key="task.id"
        class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4"
      >
        <!-- Cabecera -->
        <div
          class="flex items-center justify-between gap-4 p-4 cursor-pointer hover:bg-gray-50 transition"
          @click="toggleOpen(task.id)"
        >
          <div class="flex-grow">
            <p class="font-medium text-gray-900">{{ task.nombre }}</p>
            <p class="text-sm text-gray-500">Responsable: {{ task.responsable }}</p>
          </div>

          <div class="flex items-center gap-3">
            <input
              type="checkbox"
              class="h-5 w-5 text-primary"
              :checked="false"
              @change.stop="toggleEstado(task)"
            />
            <!-- ✏️ Editar -->
            <button
              @click.stop="openEdit(task)"
              class="text-blue-500 hover:text-blue-700 text-xl"
              title="Editar tarea"
            >
              ✏️
            </button>
            <!-- 🗑️ Eliminar -->
            <button
              @click.stop="deleteTask(task.id)"
              class="text-red-500 hover:text-red-700 text-xl"
              title="Eliminar tarea"
            >
              🗑️
            </button>
            <span class="material-symbols-outlined text-gray-400">
              {{ openTaskId === task.id ? '-' : '+' }}
            </span>
          </div>
        </div>

        <!-- Detalles -->
        <div
          v-if="openTaskId === task.id"
          class="px-4 pb-4 text-sm text-gray-600 bg-gray-50 border-t border-gray-200"
        >
          <p><strong>Descripción:</strong> {{ task.descripcion || 'Sin descripción' }}</p>
          <p class="mt-2 text-xs text-gray-400">
            Creado: {{ formatFecha(task.fechaCreacion) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Completadas -->
    <div>
      <h3 class="text-xl font-bold text-gray-800 mb-4 border-b-2 border-primary/20 pb-2">
        Completadas
      </h3>
      <div v-if="completadas.length === 0" class="text-gray-500">
        No hay tareas completadas.
      </div>

      <div
        v-for="task in completadas"
        :key="task.id"
        class="bg-gray-100 rounded-xl shadow-sm border border-gray-300 opacity-70 mb-4"
      >
        <div class="flex items-center justify-between gap-4 p-4">
          <div class="flex-grow">
            <p class="font-medium text-gray-900 line-through">{{ task.nombre }}</p>
            <p class="text-sm text-gray-500">Responsable: {{ task.responsable }}</p>
          </div>
          <div class="flex items-center gap-3">
            <input
              type="checkbox"
              class="h-5 w-5 text-primary"
              :checked="true"
              @change="toggleEstado(task)"
            />
            <button
              @click="deleteTask(task.id)"
              class="text-red-500 hover:text-red-700 text-xl"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal solo para edición -->
    <TaskForm
      :visible="showEditForm"
      mode="edit"
      :task="selectedTask"
      @close="showEditForm = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { db } from "../../firebase/firebaseConfig";
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore";
import TaskForm from "./TaskForm.vue";

const tasks = ref([]);
const openTaskId = ref(null);
const showEditForm = ref(false);
const selectedTask = ref(null);

onMounted(() => {
  onSnapshot(collection(db, "tareas"), (snapshot) => {
    tasks.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  });
});

const deleteTask = async (id) => {
  await deleteDoc(doc(db, "tareas", id));
};

const toggleEstado = async (task) => {
  const refTarea = doc(db, "tareas", task.id);
  const nuevoEstado = task.estado === "completada" ? "pendiente" : "completada";
  await updateDoc(refTarea, { estado: nuevoEstado });
};

const toggleOpen = (id) => {
  openTaskId.value = openTaskId.value === id ? null : id;
};

const openEdit = (task) => {
  selectedTask.value = task;
  showEditForm.value = true;
};

const pendientes = computed(() => tasks.value.filter(t => t.estado === "pendiente"));
const completadas = computed(() => tasks.value.filter(t => t.estado === "completada"));

const formatFecha = (timestamp) => {
  if (!timestamp || !timestamp.toDate) return "";
  const date = timestamp.toDate();
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<style scoped>
.material-symbols-outlined {
  font-family: "Material Symbols Outlined";
  font-size: 20px;
  user-select: none;
}
</style>

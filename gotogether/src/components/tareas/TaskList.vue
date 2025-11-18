<!-- components/tareas/TaskList.vue -->
<template>
  <div class="max-w-4xl mx-auto mt-8 space-y-12">

    <!-- Botones -->
    <div class="flex gap-4 mb-6">
      <button
        @click="generarPDF"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
      >
        📄 Generar PDF
      </button>

      <button
        @click="copiarEnlace"
        class="px-4 py-2 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-800"
      >
        🔗 Copiar enlace del viaje
      </button>
    </div>

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
        <div
          class="flex items-center justify-between gap-4 p-4 cursor-pointer hover:bg-gray-50 transition"
          @click="toggleOpen(task.id)"
        >
          <div class="flex-grow">
            <p class="font-medium text-gray-900">{{ task.nombre }}</p>
            <p class="text-sm text-gray-500">Responsable: {{ aliasMap[task.responsable] }}</p>
            <p v-if="task.fechaLimite" class="text-xs text-gray-400">
  ⏳ Fecha límite: {{ formatFecha(task.fechaLimite) }}
</p>

          </div>

          <div class="flex items-center gap-3">
            <input
              type="checkbox"
              class="h-5 w-5 text-primary"
              :checked="false"
              @change.stop="toggleEstado(task)"
            />
            <!-- Editar -->
            <button
              @click.stop="openEdit(task)"
              class="text-blue-500 hover:text-blue-700 text-xl"
              title="Editar tarea"
            >
              ✏️
            </button>
            <!-- Eliminar -->
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

<!-- NUEVO: FECHA LÍMITE -->
<p v-if="task.fechaLimite" class="mt-2">
  <strong>Fecha límite:</strong> {{ formatFecha(task.fechaLimite) }}
</p>

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
            <p class="text-sm text-gray-500">Responsable: {{ aliasMap[task.responsable] }}</p>
            <p v-if="task.fechaLimite" class="text-xs text-gray-400">
  ⏳ Fecha límite: {{ formatFecha(task.fechaLimite) }}
</p>

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

    <!-- Modal -->
    <TaskForm
      :visible="showEditForm"
      mode="edit"
      :task="selectedTask"
      :tripId="tripId"
      @close="showEditForm = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { db } from "../../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "@/assets/logo.png";

import TaskForm from "./TaskForm.vue";

const route = useRoute();
const tripId = ref(route.params.id);
const tasks = ref([]);
const aliasMap = ref({});

// Modal
const showEditForm = ref(false);
const selectedTask = ref(null);

const openTaskId = ref(null);

const subscribeTasks = () => {
  if (!tripId.value) return;

  const q = query(collection(db, "tareas"), where("tripId", "==", tripId.value));

  return onSnapshot(q, (snapshot) => {
    tasks.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  });
};

// Cargar alias
onMounted(async () => {
  const tripRef = doc(db, "trips", tripId.value);
  const snap = await getDoc(tripRef);

  if (snap.exists()) {
    aliasMap.value = snap.data().alias || {};
  }

  subscribeTasks();
});

// Acciones
const deleteTask = async (id) => {
  await deleteDoc(doc(db, "tareas", id));
};

const toggleEstado = async (task) => {
  const refTarea = doc(db, "tareas", task.id);
  const nuevo = task.estado === "completada" ? "pendiente" : "completada";
  await updateDoc(refTarea, { estado: nuevo });
};

const toggleOpen = (id) => {
  openTaskId.value = openTaskId.value === id ? null : id;
};

const openEdit = (task) => {
  selectedTask.value = task;
  showEditForm.value = true;
};

// Computeds
const pendientes = computed(() => tasks.value.filter((t) => t.estado === "pendiente"));
const completadas = computed(() => tasks.value.filter((t) => t.estado === "completada"));

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

// Copiar
const copiarEnlace = () => {
  const url = window.location.href;
  navigator.clipboard.writeText(url);
  alert("Enlace copiado");
};

// PDF elegante
const generarPDF = () => {
  const pdf = new jsPDF("p", "pt", "letter");

  // ---- Logo ----
  const pageWidth = pdf.internal.pageSize.getWidth();
  pdf.addImage(logo, "PNG", pageWidth / 2 - 90, 20, 180, 180);

  // ---- Título ----
  pdf.setFontSize(24);
  pdf.setFont("Helvetica", "bold");
  pdf.text("Lista de Tareas del Viaje", pageWidth / 2, 230, { align: "center" });

  // ---- Subtítulo ----
  pdf.setFontSize(12);
  pdf.setFont("Helvetica", "normal");
  pdf.text(
    "Planifica tu próxima aventura · Colabora, explora y crea recuerdos inolvidables con tus amigos.",
    pageWidth / 2,
    255,
    { align: "center", maxWidth: 460 }
  );

  // ---- ÚNICA HOJA ----
  let y = 300; // Posición inicial después del título

  // ----- Tabla: Pendientes -----
  autoTable(pdf, {
    startY: y,
    head: [["Pendientes"]],
    body: [],
    styles: { halign: "center", fillColor: [220, 220, 255], fontSize: 11 },
    margin: { left: 30, right: 30 },
    pageBreak: "avoid",
  });

  autoTable(pdf, {
    startY: pdf.lastAutoTable.finalY + 5,
    head: [["Nombre", "Descripción", "Responsable", "Fecha límite"]],

    body: pendientes.value.map((t) => [
  t.nombre,
  t.descripcion || "—",
  aliasMap.value[t.responsable],
  t.fechaLimite ? formatFecha(t.fechaLimite) : "—",
]),

    styles: { fontSize: 10, cellPadding: 2, overflow: "linebreak" },
    headStyles: { fillColor: [80, 120, 200], textColor: 255 },
    margin: { left: 30, right: 30 },
    pageBreak: "avoid",
  });

  // ----- Tabla: Completadas -----
  autoTable(pdf, {
    startY: pdf.lastAutoTable.finalY + 20,
    head: [["Completadas"]],
    body: [],
    styles: { halign: "center", fillColor: [200, 255, 200], fontSize: 11 },
    margin: { left: 30, right: 30 },
    pageBreak: "avoid",
  });

  autoTable(pdf, {
    startY: pdf.lastAutoTable.finalY + 5,
    head: [["Nombre", "Descripción", "Responsable", "Fecha límite"]],

    body: completadas.value.map((t) => [
  t.nombre,
  t.descripcion || "—",
  aliasMap.value[t.responsable],
  t.fechaLimite ? formatFecha(t.fechaLimite) : "—",
]),

    styles: { fontSize: 10, cellPadding: 2, overflow: "linebreak" },
    headStyles: { fillColor: [80, 200, 120], textColor: 255 },
    margin: { left: 30, right: 30 },
    pageBreak: "avoid",
  });

  // ---- Guardar ----
  pdf.save("tareas_viaje.pdf");
};



</script>

<style scoped>
.material-symbols-outlined {
  font-family: "Material Symbols Outlined";
  font-size: 20px;
  user-select: none;
}
</style>

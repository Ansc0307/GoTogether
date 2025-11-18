<!-- components/tareas/TaskForm.vue -->
<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
  >
    <div
      class="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-2xl relative font-display"
    >
      <!-- Botón cerrar -->
      <button
        @click="handleClose"
        class="absolute top-3 right-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-2xl"
      >
        ×
      </button>

      <!-- Encabezado -->
      <div class="mb-6">
        <h2 class="text-3xl font-extrabold text-slate-900 dark:text-white">
          {{ mode === "edit" ? "Editar tarea" : "Nueva tarea" }}
        </h2>
        <p class="mt-1 text-slate-600 dark:text-slate-400 text-sm">
          {{ mode === "edit"
            ? "Modifica los detalles de esta tarea."
            : "Completa los detalles para crear una nueva tarea para tu viaje." }}
        </p>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="saveTask" class="space-y-6">
        <!-- Nombre -->
        <div>
          <label class="block text-sm font-medium mb-1">Nombre</label>
          <input
            v-model="nombre"
            type="text"
            placeholder="Ej. Reservar alojamiento"
            class="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-800 border"
          />
        </div>

        <!-- Descripción -->
        <div>
          <label class="block text-sm font-medium mb-1">Descripción</label>
          <textarea
            v-model="descripcion"
            rows="4"
            placeholder="Detalles, presupuesto..."
            class="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-800 border"
          ></textarea>
        </div>

        <!-- Fecha límite -->
        <div>
          <label class="block text-sm font-medium mb-1">Fecha límite</label>
          <input
            v-model="fechaLimite"
            type="date"
            class="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-800 border"
          />
        </div>

        <!-- Responsable -->
        <div>
          <label class="block text-sm font-medium mb-1">Asignar al responsable</label>

          <select
            v-model="responsable"
            class="w-full px-4 py-3 rounded-lg bg-white dark:bg-slate-800 border focus:ring-primary"
          >
            <option disabled value="">Selecciona un miembro del grupo</option>

            <option
              v-for="correo in miembros"
              :key="correo"
              :value="correo"
            >
              {{ aliasLabel(correo) }}
              <span v-if="correo === userEmail"> (Tú)</span>
            </option>
          </select>
        </div>

        <!-- Botón -->
        <div class="flex justify-end pt-2">
          <button
            type="submit"
            class="bg-primary text-white font-bold py-3 px-6 rounded-lg"
          >
            {{ mode === "edit" ? "Guardar cambios" : "Crear tarea" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { db } from "../../firebase/firebaseConfig";
import { collection, addDoc, updateDoc, doc, getDoc, Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const props = defineProps({
  visible: Boolean,
  mode: { type: String, default: "create" },
  task: { type: Object, default: null },
  tripId: String,
});

const emit = defineEmits(["close"]);

const nombre = ref("");
const descripcion = ref("");
const responsable = ref("");
const fechaLimite = ref("");

const miembros = ref([]);
const aliasMap = ref({});

const userEmail = ref(null);

// Cargar miembros + alias del viaje
onMounted(async () => {
  try {
    const auth = getAuth();
    userEmail.value = auth.currentUser?.email || null;

    if (!props.tripId) return;

    const tripRef = doc(db, "trips", props.tripId);
    const tripSnap = await getDoc(tripRef);

    if (tripSnap.exists()) {
      const data = tripSnap.data();

      miembros.value = data.members || [];
      aliasMap.value = data.alias || {};
    }
  } catch (e) {
    console.error("Error al cargar miembros:", e);
  }
});

// Mostrar alias + correo
const aliasLabel = (correo) => {
  const alias = aliasMap.value[correo];
  return alias ? `${alias} (${correo})` : correo;
};

// Reset form
const resetForm = () => {
  nombre.value = "";
  descripcion.value = "";
  responsable.value = "";
  fechaLimite.value = "";
};

// Cargar datos en modo editar
watch(
  () => [props.task, props.mode, props.visible],
  ([newTask, mode, visible]) => {
    if (visible) {
      if (mode === "edit" && newTask) {
        nombre.value = newTask.nombre || "";
        descripcion.value = newTask.descripcion || "";
        responsable.value = newTask.responsable || "";
        fechaLimite.value = newTask.fechaLimite
          ? newTask.fechaLimite.toDate().toISOString().split("T")[0]
          : "";
      } else {
        resetForm();
      }
    }
  },
  { immediate: true }
);

// Guardar o actualizar
const saveTask = async () => {
  if (!nombre.value.trim()) return alert("Falta el nombre de la tarea");
  if (!responsable.value.trim()) return alert("Selecciona un responsable");

  const fechaLimiteTimestamp = fechaLimite.value
    ? Timestamp.fromDate(new Date(fechaLimite.value))
    : null;

  if (props.mode === "edit" && props.task?.id) {
    await updateDoc(doc(db, "tareas", props.task.id), {
      nombre: nombre.value,
      descripcion: descripcion.value,
      responsable: responsable.value,
      fechaLimite: fechaLimiteTimestamp,
    });
  } else {
    await addDoc(collection(db, "tareas"), {
      nombre: nombre.value,
      descripcion: descripcion.value,
      responsable: responsable.value,
      estado: "pendiente",
      fechaLimite: fechaLimiteTimestamp,
      fechaCreacion: Timestamp.now(),
      tripId: props.tripId,
    });
  }

  handleClose();
};

const handleClose = () => {
  resetForm();
  emit("close");
};
</script>

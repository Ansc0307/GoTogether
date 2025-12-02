// ...existing code...
<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 backdrop-blur-sm p-4 sm:p-0"
  >
    <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-md p-6 sm:p-8 relative animate-fadeIn max-h-[90vh] overflow-auto">

      <!-- Botón cerrar -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        aria-label="Cerrar"
      >
        <span class="material-symbols-outlined text-2xl">close</span>
      </button>

      <h2 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-1">Editar Viaje</h2>
      <p class="text-center text-gray-500 dark:text-gray-300 text-sm mb-4 sm:mb-6">Modifica los detalles de tu viaje</p>

      <LoadingSpinner v-if="cargando" message="Guardando..." />

      <form v-else @submit.prevent="guardarCambios" class="space-y-4">

        <!-- Nombre -->
        <div>
          <label class="block text-gray-700 dark:text-gray-200 font-medium mb-1 text-sm">Nombre del viaje</label>
          <input v-model="form.nombre" type="text" class="w-full border rounded-lg px-3 py-2 text-sm" required />
        </div>

        <!-- Destino -->
        <div>
          <label class="block text-gray-700 dark:text-gray-200 font-medium mb-1 text-sm">Destino específico</label>
          <input v-model="form.destinoEspecifico" type="text" class="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>

        <!-- Fechas -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-gray-700 dark:text-gray-200 font-medium mb-1 text-sm">Fecha de inicio</label>
            <input v-model="form.fechaInicio" type="date" class="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label class="block text-gray-700 dark:text-gray-200 font-medium mb-1 text-sm">Fecha fin</label>
            <input v-model="form.fechaFin" type="date" class="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
        </div>

        <!-- Presupuesto -->
        <div>
          <label class="block text-gray-700 dark:text-gray-200 font-medium mb-1 text-sm">Presupuesto base</label>
          <div class="flex items-center border rounded-lg px-3 py-2 text-sm">
            <span class="mr-2 text-gray-500">Bs.</span>
            <input v-model="form.presupuesto" type="number" class="flex-1 outline-none bg-transparent text-sm" />
          </div>
        </div>

        <!-- Agregar miembro (responsive) -->
        <div>
          <label class="block text-gray-700 dark:text-gray-200 font-medium mb-1 text-sm">Agregar colaborador</label>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              v-model="correoMiembro"
              type="email"
              placeholder="Correo"
              class="col-span-1 sm:col-span-2 border rounded-lg px-3 py-2 text-sm w-full"
            />
            <button
              type="button"
              @click="agregarMiembro"
              class="bg-primary text-white px-4 py-2 rounded-lg w-full sm:w-auto text-sm"
            >
              Agregar
            </button>
          </div>
        </div>

        <!-- Lista de miembros con alias (responsive grid) -->
        <div v-if="form.miembros.length" class="invite-scroll mt-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="(correo, index) in form.miembros"
              :key="correo"
              class="border rounded-lg p-3 flex flex-col gap-3 bg-gray-50 dark:bg-slate-800"
            >
              <div class="flex items-center gap-3 w-full sm:w-auto">
                <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary font-bold text-sm">
                  {{ (aliasMap[correo] || correo).slice(0,2).toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">

                  <div class="flex items-center justify-between">
                    <strong class="text-primary text-sm">{{ aliasMap[correo] }}</strong>
                    <button @click="eliminarMiembro(index)" class="text-gray-400 hover:text-red-500 text-sm" aria-label="Eliminar miembro">✕</button>
                  </div>
                  <span class="text-[10px] text-gray-600 break-words">{{ correo }}</span>




                </div>
              </div>

              <!-- Editar alias -->
              <input
                v-model="aliasMap[correo]"
                type="text"
                placeholder="Alias"
                class="mt-2 sm:mt-0 border rounded-lg px-2 py-1 text-sm w-full sm:w-36"
              />
            </div>
          </div>
        </div>

        <!-- Botones (stack en móvil) -->
        <div class="flex flex-col sm:flex-row justify-between gap-3 mt-4">
          <button type="submit" class="w-full sm:flex-1 bg-primary text-white py-2 rounded-lg text-sm">Guardar cambios</button>
          <button type="button" @click="confirmDelete" class="w-full sm:flex-1 bg-red-500 text-white py-2 rounded-lg text-sm">Eliminar Viaje</button>
        </div>
      </form>

    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import LoadingSpinner from "../budget/LoadingSpinner.vue";

const props = defineProps({
  visible: Boolean,
  tripId: String
});

const emit = defineEmits(["close"]);

const cargando = ref(false);

const form = ref({
  nombre: "",
  destinoEspecifico: "",
  fechaInicio: "",
  fechaFin: "",
  presupuesto: 0,
  miembros: []
});

// aliasMap: { correo : alias }
const aliasMap = ref({});

const correoMiembro = ref("");

// Cargar datos del viaje
const loadTripData = async () => {
  if (!props.tripId) return;
  const refDoc = doc(db, "trips", props.tripId);
  const snap = await getDoc(refDoc);

  if (snap.exists()) {
    const data = snap.data();

    form.value = {
      nombre: data.name || "",
      destinoEspecifico: data.destination || "",
      fechaInicio: data.startDate || "",
      fechaFin: data.endDate || "",
      presupuesto: data.budget || 0,
      miembros: data.members || []
    };

    // cargar alias
    aliasMap.value = { ...(data.alias || {}) };

    // generar alias automáticos si faltan
    form.value.miembros.forEach((correo, i) => {
      if (!aliasMap.value[correo]) {
        aliasMap.value[correo] = `Miembro ${i + 1}`;
      }
    });
  }
};

onMounted(loadTripData);

watch(() => props.visible, (v) => {
  if (v) loadTripData();
});

// Agregar nuevo miembro
const agregarMiembro = () => {
  const correo = correoMiembro.value.trim();
  if (!correo) return;

  if (!form.value.miembros.includes(correo)) {
    form.value.miembros.push(correo);
    aliasMap.value[correo] = `Miembro ${form.value.miembros.length}`;
  }

  correoMiembro.value = "";
};

// Eliminar miembro
const eliminarMiembro = (index) => {
  const correo = form.value.miembros[index];
  delete aliasMap.value[correo];
  form.value.miembros.splice(index, 1);
};

// Guardar cambios
const guardarCambios = async () => {
  cargando.value = true;

  try {
    const refDoc = doc(db, "trips", props.tripId);

    await updateDoc(refDoc, {
      name: form.value.nombre,
      destination: form.value.destinoEspecifico,
      startDate: form.value.fechaInicio,
      endDate: form.value.fechaFin,
      budget: parseFloat(form.value.presupuesto) || 0,
      members: form.value.miembros,
      alias: aliasMap.value
    });

    alert("Cambios guardados exitosamente");
    emit("close");
  } catch (e) {
    console.error(e);
    alert("Error al guardar");
  } finally {
    cargando.value = false;
  }
};

// Eliminar viaje
const confirmDelete = async () => {
  if (confirm("¿Seguro que quieres eliminar este viaje?")) {
    cargando.value = true;

    try {
      await deleteDoc(doc(db, "trips", props.tripId));
      alert("Viaje eliminado.");
      emit("close");
      window.location.href = "/misviajes";
    } catch (e) {
      alert("Error al eliminar");
    } finally {
      cargando.value = false;
    }
  }
};
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.25s ease-out;
}

/* Altura de lista de miembros: más pequeña en móvil, mayor en pantallas grandes */
.invite-scroll {
  max-height: 28vh;
  overflow-y: auto;
  padding-right: 4px;
}
@media (min-width: 640px) {
  .invite-scroll {
    max-height: 250px;
  }
}
</style>
<!-- /components/trips/EditTripForm.vue -->
<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 backdrop-blur-sm"
  >
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-fadeIn">

      <!-- Botón cerrar -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
      >
        <span class="material-symbols-outlined text-2xl">close</span>
      </button>

      <h2 class="text-2xl font-bold text-gray-800 text-center mb-1">Editar Viaje</h2>
      <p class="text-center text-gray-500 text-sm mb-6">Modifica los detalles de tu viaje</p>

      <LoadingSpinner v-if="cargando" message="Guardando..." />

      <form v-else @submit.prevent="guardarCambios" class="space-y-4">

        <!-- Nombre -->
        <div>
          <label class="block text-gray-700 font-medium mb-1">Nombre del viaje</label>
          <input v-model="form.nombre" type="text" class="w-full border rounded-lg px-3 py-2" required />
        </div>

        <!-- Destino -->
        <div>
          <label class="block text-gray-700 font-medium mb-1">Destino específico</label>
          <input v-model="form.destinoEspecifico" type="text" class="w-full border rounded-lg px-3 py-2" />
        </div>

        <!-- Fechas -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-gray-700 font-medium mb-1">Fecha de inicio</label>
            <input v-model="form.fechaInicio" type="date" class="w-full border rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label class="block text-gray-700 font-medium mb-1">Fecha fin</label>
            <input v-model="form.fechaFin" type="date" class="w-full border rounded-lg px-3 py-2" required />
          </div>
        </div>

        <!-- Presupuesto -->
        <div>
          <label class="block text-gray-700 font-medium mb-1">Presupuesto base</label>
          <div class="flex items-center border rounded-lg px-3 py-2">
            <span class="mr-2 text-gray-500">Bs.</span>
            <input v-model="form.presupuesto" type="number" class="flex-1 outline-none bg-transparent" />
          </div>
        </div>

        <!-- Agregar miembro -->
        <div>
          <label class="block text-gray-700 font-medium mb-1">Agregar colaborador</label>

          <div class="grid grid-cols-3 gap-2">
            <input v-model="correoMiembro" type="email" placeholder="Correo" class="col-span-2 border rounded-lg px-3 py-2" />
            <button type="button" @click="agregarMiembro" class="bg-primary text-white px-4 py-2 rounded-lg">Agregar</button>
          </div>
        </div>

        <!-- Lista de miembros con alias -->
        <div v-if="form.miembros.length" class="invite-scroll mt-4 space-y-2">

          <div
            v-for="(correo, index) in form.miembros"
            :key="correo"
            class="border rounded-lg p-3 flex flex-col gap-1 bg-gray-50"
          >
            <div class="flex justify-between items-center">
              <strong class="text-primary">{{ aliasMap[correo] }}</strong>
              <button @click="eliminarMiembro(index)" class="text-gray-400 hover:text-red-500 text-sm">✕</button>
            </div>

            <span class="text-xs text-gray-600">{{ correo }}</span>

            <!-- Editar alias -->
            <input
              v-model="aliasMap[correo]"
              type="text"
              placeholder="Alias"
              class="mt-1 border rounded-lg px-2 py-1 text-sm"
            />
          </div>
        </div>

        <!-- Botones -->
        <div class="flex justify-between gap-2 mt-4">
          <button type="submit" class="flex-1 bg-primary text-white py-2 rounded-lg">Guardar cambios</button>
          <button type="button" @click="confirmDelete" class="flex-1 bg-red-500 text-white py-2 rounded-lg">Eliminar Viaje</button>
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
  const refDoc = doc(db, "trips", props.tripId);
  const snap = await getDoc(refDoc);

  if (snap.exists()) {
    const data = snap.data();

    form.value = {
      nombre: data.name,
      destinoEspecifico: data.destination || "",
      fechaInicio: data.startDate,
      fechaFin: data.endDate,
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
  animation: fadeIn 0.3s ease-out;
}

.invite-scroll {
  max-height: 250px;
  overflow-y: auto;
}
</style>

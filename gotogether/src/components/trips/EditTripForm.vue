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

      <h2 class="text-2xl font-bold text-gray-800 text-center mb-1">
        Editar Viaje
      </h2>
      <p class="text-center text-gray-500 text-sm mb-6">
        Modifica los detalles de tu viaje
      </p>

      <LoadingSpinner v-if="cargando" message="Guardando..." />

      <form v-else @submit.prevent="guardarCambios" class="space-y-4">
        <!-- Nombre del viaje -->
        <div>
          <label class="block text-gray-700 font-medium mb-1">Nombre del viaje</label>
          <input v-model="form.nombre" type="text" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none" required />
        </div>

        <!-- Destino -->
        <div>
          <label class="block text-gray-700 font-medium mb-1">Destino específico</label>
          <input v-model="form.destinoEspecifico" type="text" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none" />
        </div>

        <!-- Fechas -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-gray-700 font-medium mb-1">Fecha de inicio</label>
            <input v-model="form.fechaInicio" type="date" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none" required />
          </div>
          <div>
            <label class="block text-gray-700 font-medium mb-1">Fecha fin</label>
            <input v-model="form.fechaFin" type="date" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none" required />
          </div>
        </div>

        <!-- Presupuesto -->
        <div>
          <label class="block text-gray-700 font-medium mb-1">Presupuesto base (opcional)</label>
          <div class="flex items-center border border-gray-300 rounded-lg px-3 py-2">
            <span class="text-gray-500 mr-2">Bs.</span>
            <input v-model="form.presupuesto" type="number" min="0" step="0.01" placeholder="0.00" class="flex-1 outline-none border-none bg-transparent" />
          </div>
        </div>

        <!-- Invitar miembros -->
        <div>
          <label class="block text-gray-700 font-medium mb-1">Invita a colaboradores</label>
          <div class="flex gap-2">
            <input v-model="correoMiembro" type="email" placeholder="Correo del colaborador" class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none" />
            <button type="button" @click="agregarMiembro" class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">Agregar</button>
          </div>

          <div v-if="form.miembros.length" class="invite-scroll mt-3">
            <span v-for="(correo, index) in form.miembros" :key="index" class="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full flex items-center gap-2 whitespace-nowrap">
              {{ correo }}
              <button type="button" @click="eliminarMiembro(index)" class="text-gray-400 hover:text-red-500 text-xs">✕</button>
            </span>
          </div>
        </div>

        <!-- Botones -->
        <div class="flex justify-between gap-2 mt-4">
          <button type="submit" class="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary/90">Guardar cambios</button>
          <button type="button" @click="confirmDelete" class="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600">Eliminar Viaje</button>
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
const correoMiembro = ref("");

const loadTripData = async () => {
  const ref = doc(db, "trips", props.tripId);
  const snap = await getDoc(ref);
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
  }
};

onMounted(loadTripData);

watch(() => props.visible, (v) => {
  if (v) loadTripData();
});

const agregarMiembro = () => {
  const correo = correoMiembro.value.trim();
  if (correo && !form.value.miembros.includes(correo)) {
    form.value.miembros.push(correo);
    correoMiembro.value = "";
  }
};

const eliminarMiembro = (index) => {
  form.value.miembros.splice(index, 1);
};

const guardarCambios = async () => {
  cargando.value = true;
  try {
    const ref = doc(db, "trips", props.tripId);
    await updateDoc(ref, {
      name: form.value.nombre,
      destination: form.value.destinoEspecifico,
      startDate: form.value.fechaInicio,
      endDate: form.value.fechaFin,
      budget: parseFloat(form.value.presupuesto) || 0,
      members: form.value.miembros
    });
    alert("Cambios guardados exitosamente!");
    emit("close");
  } catch (e) {
    console.error(e);
    alert("Error al guardar los cambios.");
  } finally {
    cargando.value = false;
  }
};

const confirmDelete = async () => {
  if (confirm("¿Seguro que quieres eliminar este viaje? Esta acción no se puede deshacer.")) {
    cargando.value = true;
    try {
      await deleteDoc(doc(db, "trips", props.tripId));
      alert("Viaje eliminado correctamente.");
      emit("close");
      window.location.href = "/misviajes";
    } catch (e) {
      console.error(e);
      alert("Error al eliminar el viaje.");
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
  display: flex;
  gap: 8px;
  overflow-x: auto;
  white-space: nowrap;
  padding-bottom: 6px;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

.invite-scroll::-webkit-scrollbar {
  height: 6px;
}

.invite-scroll::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 3px;
}
</style>

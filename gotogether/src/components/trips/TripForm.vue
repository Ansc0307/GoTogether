<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 backdrop-blur-sm"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-fadeIn"
    >
      <!-- Botón cerrar -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
      >
        <span class="material-symbols-outlined text-2xl">close</span>
      </button>

      <!-- Encabezado -->
      <h2 class="text-2xl font-bold text-gray-800 text-center mb-1">
        Organiza un nuevo viaje
      </h2>
      <p class="text-center text-gray-500 text-sm mb-6">
        Planifica tu próxima aventura
      </p>

      <!-- 🔹 Spinner -->
      <LoadingSpinner v-if="cargando" message="Guardando tu viaje..." />

      <div v-if="sendingEmails" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-center">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span class="text-blue-700 text-sm">Enviando invitaciones...</span>
        </div>
      </div>

      <!-- Formulario -->
      <form v-else @submit.prevent="crearViaje" class="space-y-4">
        <!-- Nombre del viaje -->
        <div>
          <label class="block text-gray-700 font-medium mb-1">Nombre del viaje</label>
          <input
            v-model="nuevoViaje.nombre"
            type="text"
            placeholder="Ej. Aventura en los Andes"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
            required
          />
        </div>

        <!-- Destino -->
        <div>
          <label class="block text-gray-700 font-medium mb-1">Destino específico</label>
          <input
            v-model="nuevoViaje.destinoEspecifico"
            type="text"
            placeholder="Ej. Salar de Uyuni, Lago Titicaca"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <!-- Fechas -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-gray-700 font-medium mb-1">Fecha de inicio</label>
            <input
              v-model="nuevoViaje.fechaInicio"
              type="date"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-1">Fecha fin</label>
            <input
              v-model="nuevoViaje.fechaFin"
              type="date"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>
        </div>

        <!-- Presupuesto -->
        <div>
          <label class="block text-gray-700 font-medium mb-1">Presupuesto base (opcional)</label>
          <div class="flex items-center border border-gray-300 rounded-lg px-3 py-2">
            <span class="text-gray-500 mr-2">Bs.</span>
            <input
              v-model="nuevoViaje.presupuesto"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              class="flex-1 outline-none border-none bg-transparent"
            />
          </div>
        </div>

        <!-- Alias propio -->
        <div>
          <label class="block text-gray-700 font-medium mb-1">Tu alias</label>
          <input
            v-model="selfAlias"
            type="text"
            placeholder="Cómo quieres que te vean (ej. Ana)"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <!-- Invitar miembros -->
        <div>
          <label class="block text-gray-700 font-medium mb-1">Invita a colaboradores</label>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
            <input
              v-model="correoMiembro"
              type="email"
              placeholder="Correo del colaborador"
              class="col-span-1 md:col-span-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <input
              v-model="aliasMiembro"
              type="text"
              placeholder="Alias (ej. Ana, Carlos)"
              class="col-span-1 md:col-span-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <button
              type="button"
              @click="agregarMiembro"
              class="col-span-1 md:col-span-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
            >
              Agregar
            </button>
          </div>

          <!-- 🔹 Contenedor scrollable horizontal -->
          <div v-if="miembros.length" class="invite-scroll mt-3">
            <span
              v-for="(correo, index) in miembros"
              :key="correo"
              class="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full flex items-center gap-2 whitespace-nowrap"
            >
              <span class="font-medium">{{ aliasMap[correo] ? aliasMap[correo] + ' ·' : '' }}</span>
              <span class="truncate">{{ correo }}</span>
              <button
                type="button"
                @click="eliminarMiembro(index)"
                class="text-gray-400 hover:text-red-500 text-xs"
              >
                ✕
              </button>
            </span>
          </div>
        </div>

        <!-- Botón crear viaje -->
        <button
          type="submit"
          :disabled="cargando || sendingEmails"
          class="w-full mt-4 bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="cargando" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
          <span v-else class="material-symbols-outlined text-base">explore</span>
          {{ cargando ? 'Creando viaje...' : 'Crear Viaje' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useTrips } from "@/composables/useTrips";
import LoadingSpinner from "../budget/LoadingSpinner.vue";

const props = defineProps({ visible: Boolean });
const emit = defineEmits(["close"]);

// Estado local del formulario
const nuevoViaje = ref({
  nombre: "",
  destinoEspecifico: "",
  fechaInicio: "",
  fechaFin: "",
  presupuesto: "",
});

const aliasMap = ref({});
const correoMiembro = ref("");
const aliasMiembro = ref("");
const selfAlias = ref("");
const miembros = ref([]); // Solo emails

// Composable para la lógica
const { 
  isLoading: cargando, 
  isSendingInvites: sendingEmails, 
  createTripWithInvitations,
  reset 
} = useTrips();

// Manejo de miembros
const agregarMiembro = () => {
  const correo = correoMiembro.value.trim();
  const alias = aliasMiembro.value.trim();
  
  if (!correo) return;
  
  if (!miembros.value.includes(correo)) {
    miembros.value.push(correo);
  }
  
  if (alias) {
    aliasMap.value[correo] = alias;
  }
  
  correoMiembro.value = "";
  aliasMiembro.value = "";
};

const eliminarMiembro = (index) => {
  const correo = miembros.value[index];
  if (correo && aliasMap.value[correo]) {
    delete aliasMap.value[correo];
  }
  miembros.value.splice(index, 1);
};

// Crear viaje
const crearViaje = async () => {
  if (!nuevoViaje.value.nombre.trim()) {
    return alert("Por favor, ingresa el nombre del viaje.");
  }

  const result = await createTripWithInvitations(
    nuevoViaje.value,
    miembros.value,
    aliasMap.value,
    selfAlias.value
  );

  if (result.success) {
    let message = "¡Viaje creado exitosamente!";
    if (miembros.value.length > 0) {
      message += `\nSe enviaron invitaciones a ${miembros.value.length} persona(s).`;
    }
    
    alert(message);
    resetForm();
    emit("close");
  } else {
    alert("Error: " + result.error);
  }
};

// Resetear formulario
const resetForm = () => {
  nuevoViaje.value = {
    nombre: "",
    destinoEspecifico: "",
    fechaInicio: "",
    fechaFin: "",
    presupuesto: "",
  };
  aliasMap.value = {};
  miembros.value = [];
  correoMiembro.value = "";
  aliasMiembro.value = "";
  selfAlias.value = "";
  reset();
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

/* 🔹 Scroll horizontal para los colaboradores */
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
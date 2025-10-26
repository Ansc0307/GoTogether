<!-- /components/trips/TripForm.vue -->
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

      <!-- Formulario -->
      <form @submit.prevent="crearViaje" class="space-y-4">
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

        <!-- Botón crear -->
        <button
          type="submit"
          class="w-full mt-4 bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-2"
        >
          <span class="material-symbols-outlined text-base">explore</span>
          Crear Viaje
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { db } from "../../firebase/firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";
// 🔒 Para más adelante (cuando haya login):
// import { getAuth } from "firebase/auth";

const props = defineProps({
  visible: Boolean,
});
const emit = defineEmits(["close"]);

const nuevoViaje = ref({
  nombre: "",
  destinoEspecifico: "",
  fechaInicio: "",
  fechaFin: "",
  presupuesto: "",
});

const crearViaje = async () => {
  if (!nuevoViaje.value.nombre.trim()) {
    return alert("Por favor, ingresa el nombre del viaje.");
  }

  try {
    // 🔐 FUTURO: cuando haya login, se obtiene el usuario actual así:
    // const auth = getAuth();
    // const user = auth.currentUser;
    // const userId = user ? user.uid : "default-user";

    const userId = "default-user"; // Valor temporal mientras no hay login

    await addDoc(collection(db, "trips"), {
      nombre: nuevoViaje.value.nombre,
      destinoEspecifico: nuevoViaje.value.destinoEspecifico || "",
      fechaInicio: nuevoViaje.value.fechaInicio,
      fechaFin: nuevoViaje.value.fechaFin,
      presupuesto: parseFloat(nuevoViaje.value.presupuesto) || 0,
      userId, // ✅ se guarda el ID del usuario (por ahora "default-user")
      fechaCreacion: Timestamp.now(),
    });

    // Limpia el formulario
    nuevoViaje.value = {
      nombre: "",
      destinoEspecifico: "",
      fechaInicio: "",
      fechaFin: "",
      presupuesto: "",
    };

    emit("close");
  } catch (error) {
    console.error("Error al crear el viaje:", error);
    alert("Hubo un error al guardar el viaje.");
  }
};
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
</style>


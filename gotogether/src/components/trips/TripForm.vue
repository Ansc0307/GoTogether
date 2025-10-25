<!-- /components/trips/TripForm.vue -->
<template>
  <div v-if="visible" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-xl shadow-xl w-full max-w-md relative">
      <button
        @click="$emit('close')"
        class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
      >
        ×
      </button>

      <h2 class="text-2xl font-bold mb-4">Nuevo Viaje</h2>

      <form @submit.prevent="addTrip" class="space-y-4">
        <input v-model="titulo" type="text" placeholder="Título del viaje" class="w-full border p-2 rounded" />
        <input v-model="ubicacion" type="text" placeholder="Ubicación" class="w-full border p-2 rounded" />
        <input v-model="fechaInicio" type="date" class="w-full border p-2 rounded" />
        <input v-model="fechaFin" type="date" class="w-full border p-2 rounded" />
        <input v-model="imagen" type="text" placeholder="URL de imagen" class="w-full border p-2 rounded" />

        <button
          type="submit"
          class="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-opacity-90 transition"
        >
          Crear viaje
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { db } from "../../firebase/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

const props = defineProps({ visible: Boolean });
const emit = defineEmits(["close"]);

const titulo = ref("");
const ubicacion = ref("");
const fechaInicio = ref("");
const fechaFin = ref("");
const imagen = ref("");

const addTrip = async () => {
  if (!titulo.value || !ubicacion.value) return alert("Completa los campos obligatorios");

  await addDoc(collection(db, "viajes"), {
    titulo: titulo.value,
    ubicacion: ubicacion.value,
    fechaInicio: fechaInicio.value,
    fechaFin: fechaFin.value,
    imagen: imagen.value,
  });

  titulo.value = "";
  ubicacion.value = "";
  fechaInicio.value = "";
  fechaFin.value = "";
  imagen.value = "";

  emit("close");
};
</script>

<template>
  <div class="relative p-8 max-w-6xl mx-auto">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Mis Viajes</h1>
    </div>

    <!-- Lista de viajes -->
    <TripList />

    <!-- Botón para crear viajes -->
    <button
      @click="mostrarFormulario = true"
      class="fixed bottom-6 right-6 bg-primary text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform duration-300"
    >
      <span class="material-symbols-outlined text-4xl leading-none">
        add_circle
      </span>
    </button>

    <!-- Formulario modal -->
    <TripForm :visible="mostrarFormulario" @close="mostrarFormulario = false" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import TripList from "../../components/trips/TripList.vue";
import TripForm from "../../components/trips/TripForm.vue";

const mostrarFormulario = ref(false);
</script>

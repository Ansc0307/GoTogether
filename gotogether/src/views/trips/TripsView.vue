<!-- /views/trips/TripsView.vue -->
<template>
  <div class="p-8 max-w-6xl mx-auto">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Mis Viajes</h1>
      <button
        @click="mostrarFormulario = true"
        class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm shadow-lg hover:bg-opacity-90"
      >
        <span class="material-symbols-outlined text-base">add_circle</span>
        <span>Nuevo Viaje</span>
      </button>
    </div>

    <TripList />
    <TripForm :visible="mostrarFormulario" @close="mostrarFormulario = false" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import TripList from "../../components/trips/TripList.vue";
import TripForm from "../../components/trips/TripForm.vue";

const mostrarFormulario = ref(false);
</script>

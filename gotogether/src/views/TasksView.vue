<!-- views/TareasView.vue -->
<template>
  <div class="p-8 max-w-5xl mx-auto">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Lista de Tareas</h1>
      <button @click="mostrarFormulario = true" class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm shadow-lg hover:bg-opacity-90">
  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 fill-white" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 11h3v-2h-3V8h-2v3H8v2h3v3h2v-3z"/>
  </svg>
  <span>Nueva Tarea</span>
</button>



    </div>

    <TaskList />
    <TaskForm :visible="mostrarFormulario" @close="mostrarFormulario = false" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import TaskForm from "../components/tareas/TaskForm.vue";
import TaskList from "../components/tareas/TaskList.vue";

const mostrarFormulario = ref(false);
</script>

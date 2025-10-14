<template>
  <div id="app">
    <h1>Prueba Firebase</h1>
    <TestFirebase />
  </div>
</template>

<script>
import TestFirebase from "./components/TestFirebase.vue"; // Importa tu componente

export default {
  name: "App",
  components: {
    TestFirebase, // Regístralo
  },
};
</script>

<style>
/* Estilos básicos para que se vea algo */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  margin-top: 40px;
}
button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}
</style>

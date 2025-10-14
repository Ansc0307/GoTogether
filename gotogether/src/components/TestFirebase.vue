<template>
  <div>
    <button @click="addTestDoc">Agregar documento de prueba</button>
  </div>
</template>

<script>
import { db } from "../firebase/firebaseConfig.js";
import { collection, addDoc } from "firebase/firestore";

export default {
  name: "TestFirebase",
  methods: {
    async addTestDoc() {
      try {
        const docRef = await addDoc(collection(db, "test"), {
          mensaje: "Hola, Firebase!",
          fecha: new Date()
        });
        console.log("Documento agregado con ID:", docRef.id);
      } catch (e) {
        console.error("Error agregando documento: ", e);
      }
    }
  }
};
</script>

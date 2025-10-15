<template>
  <div class="test-firebase">
    <h3>🔥 Prueba de Firebase</h3>
    
    <div class="test-actions">
      <button @click="addTestDoc" :disabled="loading" class="btn-primary">
        {{ loading ? '⏳ Guardando...' : '➕ Agregar Documento' }}
      </button>
      
      <button @click="fetchTestDocs" :disabled="loading" class="btn-secondary">
        {{ loading ? '⏳ Cargando...' : '📋 Ver Documentos' }}
      </button>
    </div>

    <!-- Mensajes de resultado -->
    <div v-if="success" class="alert alert-success">
      ✅ {{ success }}
    </div>
    
    <div v-if="error" class="alert alert-error">
      ❌ {{ error }}
    </div>

    <!-- Lista de documentos -->
    <div v-if="documents.length > 0" class="documents-list">
      <h4>📄 Documentos en Firebase:</h4>
      <div v-for="doc in documents" :key="doc.id" class="doc-item">
        <strong>ID:</strong> {{ doc.id }}<br>
        <strong>Mensaje:</strong> {{ doc.mensaje }}<br>
        <strong>Fecha:</strong> {{ formatDate(doc.fecha) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { db } from "../firebase/firebaseConfig.js"
import { collection, addDoc, getDocs } from "firebase/firestore"

const loading = ref(false)
const success = ref('')
const error = ref('')
const documents = ref([])

const addTestDoc = async () => {
  loading.value = true
  success.value = ''
  error.value = ''
  
  try {
    const docRef = await addDoc(collection(db, "test"), {
      mensaje: "Hola desde GoTogether! 🎉",
      fecha: new Date(),
      usuario: "Josh"
    })
    
    success.value = `✅ Documento agregado con ID: ${docRef.id}`
    console.log("✅ Documento agregado con ID:", docRef.id)
    
    // Actualizar la lista automáticamente
    await fetchTestDocs()
  } catch (e) {
    error.value = `Error: ${e.message}`
    console.error("❌ Error agregando documento:", e)
  } finally {
    loading.value = false
  }
}

const fetchTestDocs = async () => {
  loading.value = true
  success.value = ''
  error.value = ''
  
  try {
    const querySnapshot = await getDocs(collection(db, "test"))
    documents.value = []
    
    querySnapshot.forEach((doc) => {
      documents.value.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    // Ordenar por fecha (más recientes primero) y tomar solo los últimos 3
    documents.value.sort((a, b) => {
      const dateA = a.fecha?.toDate?.() || new Date(a.fecha)
      const dateB = b.fecha?.toDate?.() || new Date(b.fecha)
      return dateB - dateA
    })
    documents.value = documents.value.slice(0, 3)
    
    const total = querySnapshot.size
    success.value = `✅ Mostrando últimos 3 de ${total} documentos`
    console.log("✅ Documentos cargados:", total)
  } catch (e) {
    error.value = `Error: ${e.message}`
    console.error("❌ Error obteniendo documentos:", e)
  } finally {
    loading.value = false
  }
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleString('es-ES')
  }
  return new Date(timestamp).toLocaleString('es-ES')
}
</script>

<style scoped>
.test-firebase {
  padding: 1rem;
}

h3 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  font-size: 1.1rem;
}

h4 {
  margin: 1rem 0 0.5rem 0;
  color: #374151;
  font-size: 0.95rem;
}

.test-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.btn-primary {
  background: #1313ec;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0f0fcb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.alert {
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.alert-success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
}

.alert-error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #ef4444;
}

.documents-list {
  margin-top: 1rem;
}

.doc-item {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.6;
}

.doc-item strong {
  color: #374151;
}
</style>

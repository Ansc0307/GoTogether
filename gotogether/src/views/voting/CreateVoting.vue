<template>
  <div class="create-voting">
    <div class="container">
      <header class="header">
        <h1 class="title">Crear nueva votación</h1>
      </header>

      <form class="form" @submit.prevent="submit">
        <label class="field">
          <span>Título</span>
          <input v-model="form.title" type="text" placeholder="Ej. ¿Dónde vamos el primer día?" required />
        </label>

        <label class="field">
          <span>Descripción (opcional)</span>
          <textarea v-model="form.description" rows="3" placeholder="Contexto de la decisión"></textarea>
        </label>

        <div class="field">
          <div class="row">
            <span>Opciones</span>
            <button type="button" class="link" @click="addOption">+ Agregar opción</button>
          </div>
          <div class="options">
            <div v-for="(opt, idx) in form.options" :key="idx" class="option-item">
              <input v-model="form.options[idx]" type="text" :placeholder="`Opción ${idx+1}`" required />
              <button type="button" class="remove" @click="removeOption(idx)" aria-label="Eliminar opción">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
        </div>

        <label class="field">
          <span>Fecha límite</span>
          <input v-model="form.deadline" type="datetime-local" />
        </label>

        <footer class="actions">
          <button type="button" class="secondary" @click="cancel">Cancelar</button>
          <button type="submit" class="primary">Crear votación</button>
        </footer>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  title: '',
  description: '',
  options: ['', ''],
  deadline: ''
})

const addOption = () => form.options.push('')
const removeOption = (idx) => {
  if (form.options.length > 2) form.options.splice(idx, 1)
}

const cancel = () => router.push('/voting')

const submit = () => {
  if (!form.title.trim()) return alert('El título es obligatorio')
  if (form.options.some(o => !o.trim())) return alert('Completa todas las opciones')
  // TODO: Guardar en Firestore
  alert('Votación creada (pendiente integración Firebase)')
  router.push('/voting')
}
</script>

<style scoped>
.container { max-width: 720px; margin: 0 auto; padding: 1rem; }
.header { margin: 1rem 0 1.25rem; }
.title { font-size: 1.5rem; font-weight: 800; margin:0; color:#0f172a }

.form { background:#fff; border:1px solid #e2e8f0; border-radius:.75rem; padding:1rem; display:flex; flex-direction:column; gap:1rem; }
.field { display:flex; flex-direction:column; gap:.5rem; }
.field > span { font-weight:600; color:#0f172a }
input, textarea { width:100%; padding:.75rem .85rem; border:1px solid #cbd5e1; border-radius:.5rem; font-size:.95rem; }
input:focus, textarea:focus { outline:none; border-color:#2563eb; box-shadow:0 0 0 3px rgba(37,99,235,.15) }

.row { display:flex; align-items:center; justify-content:space-between; }
.link { background:transparent; border:none; color:#2563eb; font-weight:600; cursor:pointer; }
.options { display:flex; flex-direction:column; gap:.5rem; }
.option-item { display:flex; align-items:center; gap:.5rem; }
.remove { background:#fee2e2; border:1px solid #fecaca; color:#991b1b; padding:.5rem; border-radius:.375rem; cursor:pointer; display:flex; }
.remove:hover { background:#fecaca }

.actions { display:flex; justify-content:flex-end; gap:.75rem; margin-top:.5rem; }
.secondary { background:#f1f5f9; border:1px solid #e2e8f0; color:#334155; padding:.6rem .9rem; border-radius:.5rem; cursor:pointer; }
.secondary:hover { background:#e2e8f0 }
.primary { background:#2563eb; border:none; color:#fff; padding:.6rem .9rem; border-radius:.5rem; cursor:pointer; font-weight:600 }
.primary:hover { background:#1d4ed8 }
</style>

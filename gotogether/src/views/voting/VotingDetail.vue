<template>
  <div class="voting-detail">
    <div class="container">
      <header class="header">
        <button class="back-btn" @click="goBack" aria-label="Volver">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          <span>Volver</span>
        </button>
        <h1 class="title">Detalle de Votación</h1>
      </header>

      <section class="card">
        <h2 class="question">{{ voting.title || 'Título de la votación' }}</h2>

        <img v-if="voting.image" class="cover" :src="voting.image" alt="Imagen de la votación" />

        <div class="content">
          <div v-if="!hasResults" class="options">
            <button
              v-for="(opt, idx) in (voting.options || [])"
              :key="idx"
              class="option-btn"
              @click="vote(opt)"
            >
              {{ opt }}
            </button>
          </div>

          <div v-else class="results">
            <div v-for="(value, label) in voting.results" :key="label" class="result-row">
              <div class="result-label">{{ label }}</div>
              <div class="bar">
                <div class="fill" :style="{ width: value + '%' }"></div>
              </div>
              <div class="percent">{{ value }}%</div>
            </div>
          </div>

          <footer class="footer">
            <div class="meta">
              <span v-if="voting.deadline">Cierra: {{ formatDeadline(voting.deadline) }}</span>
              <span v-if="voting.voters && voting.voters.length"> • {{ voting.voters.length }} votantes</span>
            </div>
            <button v-if="hasResults" class="primary" @click="shareResults">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              <span>Compartir resultados</span>
            </button>
          </footer>
        </div>
      </section>

      <!-- Toast Notification -->
      <transition name="toast-fade">
        <div v-if="toast.show" class="toast" role="status" aria-live="polite">
          {{ toast.message }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Mock básico: se reemplazará con Firestore más adelante
const mockById = (id) => {
  if (id === '3') {
    return {
      id: 3,
      title: '¿Cuál es nuestro presupuesto por día?',
      results: { '50 USD': 45, '75 USD': 30, '100 USD': 25 },
      image: 'https://images.unsplash.com/photo-1521540216272-a50305cd4421?q=80&w=1200&auto=format&fit=crop'
    }
  }
  return {
    id,
    title: '¿Dónde deberíamos ir primero?',
    options: ['La Paz', 'Sucre', 'Cochabamba'],
    voters: ['Ana', 'Juan'],
    deadline: new Date(Date.now() + 2*24*60*60*1000),
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop'
  }
}

const voting = computed(() => mockById(String(route.params.id)))
const hasResults = computed(() => !!voting.value?.results)

const goBack = () => router.back()

// Toast
const toast = ref({ show: false, message: '' })
const showToast = (message) => {
  toast.value = { show: true, message }
  window.clearTimeout(showToast._t)
  showToast._t = window.setTimeout(() => (toast.value.show = false), 2500)
}

const vote = (option) => {
  // TODO: Integrar guardado en Firebase
  showToast(`Voto registrado: ${option}`)
}
const shareResults = () => {
  navigator.clipboard?.writeText(window.location.href)
  showToast('Enlace de resultados copiado')
}

const formatDeadline = (date) => {
  try {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
    return d.toLocaleString('es-BO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false
    })
  } catch { return '' }
}
</script>

<style scoped>
.container { max-width: 960px; margin: 0 auto; padding: 1rem; }
.header { display: flex; align-items: center; gap: 1rem; margin: 1rem 0 1.25rem; }
.back-btn { display:flex; align-items:center; gap:.5rem; background:#f1f5f9; border:1px solid #e2e8f0; color:#334155; padding:.5rem .75rem; border-radius:.5rem; cursor:pointer; }
.back-btn:hover { background:#e2e8f0 }
.title { font-size:1.5rem; font-weight:800; margin:0; color:#0f172a }

.card { background:#fff; border:1px solid #e2e8f0; border-radius:.75rem; overflow:hidden; box-shadow:0 1px 2px rgba(0,0,0,.05); }
.question { font-size:1.25rem; font-weight:700; padding:1rem 1rem 0; margin:0; color:#111827 }
.cover { width:100%; height:220px; object-fit:cover; margin-top:.75rem; }
.content { padding:1rem; }
.options { display:grid; grid-template-columns:1fr; gap:.75rem; margin-top:1rem; }
.option-btn { background:#dbeafe; color:#1e3a8a; padding:.75rem 1rem; border:none; border-radius:.5rem; font-weight:600; cursor:pointer; }
.option-btn:hover { background:#bfdbfe }

.results { display:flex; flex-direction:column; gap:.75rem; margin-top:1rem; }
.result-row { display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:.5rem; }
.result-label { color:#0f172a; font-weight:600 }
.bar { height:10px; background:#e2e8f0; border-radius:999px; overflow:hidden }
.fill { height:100%; background:#60a5fa }
.percent { color:#334155; font-variant-numeric: tabular-nums }

.footer { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-top:1rem; }
.meta { color:#475569; font-size:.875rem }
.primary { display:flex; align-items:center; gap:.5rem; background:#2563eb; color:#fff; border:none; padding:.625rem .9rem; border-radius:.5rem; cursor:pointer; }
.primary:hover { background:#1d4ed8 }

/* Toast */
.toast { position: fixed; right: 16px; bottom: 16px; background: #0f172a; color:#fff; padding:.6rem .8rem; border-radius:.5rem; box-shadow: 0 8px 16px rgba(0,0,0,.2); font-size:.9rem }
.toast-fade-enter-active, .toast-fade-leave-active { transition: opacity .2s, transform .2s }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translateY(6px) }

@media (min-width: 640px) {
  .options { grid-template-columns: repeat(2, minmax(0,1fr)); }
}
</style>

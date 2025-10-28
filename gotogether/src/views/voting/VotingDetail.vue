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

      <section class="card" v-if="voting">
        <h2 class="question">{{ voting.title || 'Título de la votación' }}</h2>

        <img v-if="voting.image" class="cover" :src="voting.image" alt="Imagen de la votación" />

        <div class="content">
          <!-- Opciones disponibles mientras no esté cerrada -->
          <div v-if="!isClosed" class="options">
            <button
              v-for="(opt, idx) in (voting.options || [])"
              :key="idx"
              class="option-btn"
              :class="{ selected: selectedOption === opt, 'voted-animate': justVoted === opt }"
              @click="vote(opt)"
              :disabled="isClosed"
            >
              <span class="opt-check" v-if="selectedOption === opt" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <span>{{ opt }}</span>
            </button>
            <p v-if="selectedOption && !isClosed" class="confirm-hint">
              Tu voto fue: <strong>{{ selectedOption }}</strong>. Puedes cambiarlo antes del cierre.
            </p>
          </div>

          <!-- Resultados: en dev se muestran en paralelo; si está cerrada, solo verás esto -->
          <div v-if="displayResults" class="results">
            <div v-for="(value, label) in resultsForDisplay" :key="label" class="result-row">
              <div class="result-label">{{ label }}</div>
              <div class="bar">
                <div class="fill" :style="{ width: value + '%' }"></div>
              </div>
              <div class="percent">{{ value }}%</div>
            </div>
          </div>
          <p v-else-if="isClosed" class="no-results">Aún no hay votos para mostrar.</p>

          <footer class="footer">
            <div class="meta">
              <span v-if="voting.deadline">Cierra: {{ formatDeadline(voting.deadline) }}</span>
              <span v-if="votersList.length"> • {{ votersList.length }} votantes</span>
            </div>
            <button v-if="votersList.length" class="secondary" @click="openVotersModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span>Quiénes votaron</span>
            </button>
            <button v-if="displayResults" class="primary" @click="shareResults">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              <span>Compartir resultados</span>
            </button>
          </footer>
        </div>
      </section>

      <!-- Estados: cargando / no encontrado -->
      <section v-else class="card placeholder">
        <div class="placeholder-content">
          <div class="skeleton title"></div>
          <div class="skeleton line"></div>
          <div class="skeleton line short"></div>
          <p class="hint">Cargando votación o no encontrada…</p>
        </div>
      </section>

      <!-- Toast Notification -->
      <transition name="toast-fade">
        <div v-if="toast.show" class="toast" role="status" aria-live="polite">
          {{ toast.message }}
        </div>
      </transition>

      <!-- Modal: Quiénes votaron -->
      <div v-if="showVotersModal" class="modal-overlay" @click.self="closeVotersModal">
        <div class="modal">
          <header class="modal-header">
            <h3 class="modal-title">Votantes ({{ votersList.length }})</h3>
            <button class="icon-btn" @click="closeVotersModal" aria-label="Cerrar">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </header>
          <div class="modal-body">
            <ul class="voters-list">
              <li v-for="v in votersList" :key="v.id" class="voter-item">
                <img v-if="v.photo" :src="v.photo" class="avatar" :alt="v.name" />
                <div v-else class="avatar initials">{{ initials(v.name) }}</div>
                <span class="name">{{ v.name }}</span>
              </li>
            </ul>
            <p v-if="!votersList.length" class="empty">Aún no hay votantes.</p>
          </div>
          <footer class="modal-footer">
            <button class="primary" @click="closeVotersModal">Cerrar</button>
          </footer>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { registrarVoto } from '../../composables/useVoting'
import { DEV_DEFAULT_TRIP_ID, PUBLIC_SHARE_BASE_URL } from '../../config/devConfig'
import { db, auth } from '../../firebase/firebaseConfig'
import { doc, onSnapshot, collection, setDoc } from 'firebase/firestore'

const route = useRoute()
const router = useRouter()

// Estado: documento en tiempo real
const voting = ref(null)
// resultados agregados (porcentaje) para votaciones reales
const aggResults = ref(null)
const votersList = ref([]) // [{id, name, photo}]
const isMock = computed(() => String(route.params.id).startsWith('mock-'))
const displayResults = computed(() => {
  if (!voting.value) return false
  if (isMock.value) return !!voting.value.results
  // Mostrar resultados cuando la votación esté cerrada (por deadline o status)
  return !!aggResults.value && isClosed.value
})
const selectedOption = ref(null)
const justVoted = ref('')

// Cerrada si: resultados presentes, status finished o deadline pasado
const isClosed = computed(() => {
  const v = voting.value
  if (!v) return false
  if (v.results) return true
  if (v.status === 'finished') return true
  try {
    const dl = v.deadline
    if (!dl) return false
    let d
    if (typeof dl === 'string' || typeof dl === 'number') d = new Date(dl)
    else if (dl?.toDate) d = dl.toDate()
    else if (dl?.seconds != null) d = new Date(dl.seconds * 1000)
    else d = dl
    return Date.now() >= d.getTime()
  } catch { return false }
})

const goBack = () => router.back()

// Toast
const toast = ref({ show: false, message: '' })
const showToast = (message) => {
  toast.value = { show: true, message }
  window.clearTimeout(showToast._t)
  showToast._t = window.setTimeout(() => (toast.value.show = false), 2500)
}

const vote = async (option) => {
  try {
    const votacionId = String(route.params.id)
    if (isMock.value) {
      selectedOption.value = option
      showToast('Demo: el voto no se guarda')
    } else {
      await registrarVoto(DEV_DEFAULT_TRIP_ID, votacionId, option)
      showToast(selectedOption.value && selectedOption.value !== option ? `Voto actualizado: ${option}` : `Voto registrado: ${option}`)
      selectedOption.value = option
    }
    // Animación sutil al votar
    justVoted.value = option
    window.setTimeout(() => { if (justVoted.value === option) justVoted.value = '' }, 700)
  } catch (e) {
    console.error(e)
    showToast(e?.message || 'Error al registrar voto')
  }
}

const shareResults = () => {
  try {
    const base = (PUBLIC_SHARE_BASE_URL || '').trim()
    const path = route.fullPath || window.location.pathname
    const url = base ? `${base.replace(/\/$/, '')}${path}` : path
    navigator.clipboard?.writeText(url)
    showToast('Enlace de resultados copiado')
  } catch {
    showToast('No se pudo copiar el enlace')
  }
}

const formatDeadline = (date) => {
  try {
    let d
    if (typeof date === 'string' || typeof date === 'number') d = new Date(date)
    else if (date?.toDate) d = date.toDate()
    else if (date?.seconds != null) d = new Date(date.seconds * 1000)
    else d = date
    return d.toLocaleString('es-BO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false
    })
  } catch { return '' }
}

// Suscripción al documento
let unsubDoc
let unsubVotes
onMounted(() => {
  const votacionId = String(route.params.id)

  // Si es mock, leer desde sessionStorage y salir
  if (isMock.value) {
    try {
      const raw = sessionStorage.getItem('mockVoting')
      if (raw) voting.value = JSON.parse(raw)
    } catch {}
    return
  }

  const ref = doc(db, 'trips', DEV_DEFAULT_TRIP_ID, 'votaciones', votacionId)
  unsubDoc = onSnapshot(ref, (snap) => {
    voting.value = snap.exists() ? { id: snap.id, ...snap.data() } : null
  }, (err) => {
    console.error('Voting detail snapshot error:', err)
  })

  // Suscribir el voto del usuario para preseleccionar si ya votó
  try {
    const user = auth.currentUser
    if (user) {
      const myVoteRef = doc(db, 'trips', DEV_DEFAULT_TRIP_ID, 'votaciones', votacionId, 'votes', user.uid)
      onSnapshot(myVoteRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data()
          if (data?.option) selectedOption.value = data.option
        }
      })
    }
  } catch (e) {
    console.warn('No se pudo suscribir al voto del usuario:', e)
  }

  // Suscripción a resultados agregados (conteo de votos por opción)
  try {
    const votesRef = collection(db, 'trips', DEV_DEFAULT_TRIP_ID, 'votaciones', votacionId, 'votes')
    unsubVotes = onSnapshot(votesRef, (snap) => {
      const counts = Object.create(null)
      let total = 0
      const voters = []
      snap.forEach(d => {
        const data = d.data()
        const opt = data?.option
        if (opt) {
          counts[opt] = (counts[opt] || 0) + 1
          total += 1
        }
        // Capturar identidad básica del votante para mostrar
        const name = data?.userName || data?.userEmail || d.id
        const photo = data?.userPhotoURL || null
        voters.push({ id: d.id, name, photo })

        // Backfill: si es el usuario actual y faltan campos, completar (merge)
        try {
          const u = auth.currentUser
          if (u && d.id === u.uid && !data?.userName && !data?.userEmail) {
            setDoc(d.ref, {
              userName: u.displayName || null,
              userEmail: u.email || null,
              userPhotoURL: u.photoURL || null,
            }, { merge: true })
          }
        } catch {}
      })
      // Guardar lista completa y mantener compatibilidad con UI previa
      votersList.value = voters
      if (voting.value) voting.value.voters = voters.map(v => v.name)
      if (!voting.value?.options?.length || total === 0) {
        aggResults.value = null
        return
      }
      const res = {}
      const options = voting.value.options
      options.forEach(opt => {
        const pct = total ? Math.round(((counts[opt] || 0) * 100) / total) : 0
        res[opt] = pct
      })
      aggResults.value = res
    })
  } catch (e) {
    console.warn('No se pudo suscribir a votos para resultados:', e)
  }
})

onBeforeUnmount(() => {
  if (unsubDoc) unsubDoc()
  if (unsubVotes) unsubVotes()
})

const resultsForDisplay = computed(() => {
  if (!voting.value) return null
  if (isMock.value) return voting.value.results || null
  return aggResults.value
})

// Modal control
const showVotersModal = ref(false)
const openVotersModal = () => { if (votersList.value.length) showVotersModal.value = true }
const closeVotersModal = () => { showVotersModal.value = false }

// Utils
const initials = (name = '') => {
  return String(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase())
    .join('') || 'U'
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
.option-btn.selected { background:#dcfce7; color:#065f46; box-shadow: 0 0 0 2px #86efac inset }
.option-btn:disabled { opacity:.8; cursor: default }
.opt-check { display:inline-flex; margin-right:.5rem }
.voted-animate { animation: pop .3s ease }
@keyframes pop { 0%{ transform: scale(1) } 50%{ transform: scale(1.03) } 100%{ transform: scale(1) } }
.confirm-hint { color:#065f46; font-weight:600; margin-top:.5rem }
/* (no edit mode styles needed) */

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
.secondary { display:flex; align-items:center; gap:.5rem; background:#f1f5f9; color:#334155; border:1px solid #e2e8f0; padding:.625rem .9rem; border-radius:.5rem; cursor:pointer; }
.secondary:hover { background:#e2e8f0 }

/* Toast */
.toast { position: fixed; right: 16px; bottom: 16px; background: #0f172a; color:#fff; padding:.6rem .8rem; border-radius:.5rem; box-shadow: 0 8px 16px rgba(0,0,0,.2); font-size:.9rem }
.toast-fade-enter-active, .toast-fade-leave-active { transition: opacity .2s, transform .2s }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translateY(6px) }

/* Placeholder */
.placeholder { border:1px dashed #e2e8f0; background:#fff }
.placeholder-content { padding:1rem }
.skeleton { background: linear-gradient(90deg,#e5e7eb, #f3f4f6, #e5e7eb); height: 12px; border-radius: 999px; margin:.5rem 0; animation: pulse 1.2s infinite }
.skeleton.title { width: 60%; height: 20px }
.skeleton.line { width: 100% }
.skeleton.short { width: 40% }
.hint { color:#64748b; font-size:.875rem; margin-top:.5rem }
@keyframes pulse { 0%{opacity:.8} 50%{opacity:1} 100%{opacity:.8} }

@media (min-width: 640px) {
  .options { grid-template-columns: repeat(2, minmax(0,1fr)); }
}

/* Modal styles */
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.45); display:flex; align-items:center; justify-content:center; z-index:1000 }
.modal { background:#fff; border-radius:.75rem; border:1px solid #e5e7eb; width:100%; max-width:520px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,.25) }
.modal-header { display:flex; align-items:center; justify-content:space-between; padding:1rem 1rem; border-bottom:1px solid #e5e7eb }
.modal-title { margin:0; font-size:1.1rem; font-weight:800; color:#0f172a }
.icon-btn { background:#f8fafc; border:1px solid #e5e7eb; border-radius:.5rem; width:34px; height:34px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer }
.icon-btn:hover { background:#f1f5f9 }
.modal-body { padding:1rem }
.voters-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:.5rem; max-height:320px; overflow:auto }
.voter-item { display:flex; align-items:center; gap:.75rem; padding:.5rem; border-radius:.5rem }
.voter-item:hover { background:#f8fafc }
.avatar { width:32px; height:32px; border-radius:999px; object-fit:cover; border:1px solid #e5e7eb }
.avatar.initials { display:inline-flex; align-items:center; justify-content:center; background:#dbeafe; color:#1e3a8a; font-weight:800 }
.name { color:#0f172a; font-weight:600 }
.empty { color:#64748b; font-size:.9rem; text-align:center; padding:1rem 0 }
.modal-footer { padding:1rem; border-top:1px solid #e5e7eb; display:flex; justify-content:flex-end }
</style>

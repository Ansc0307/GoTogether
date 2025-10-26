<template>
  <div class="voting-list">
    <!-- Main Content -->
    <main class="main-content">
      <div class="container">
        <!-- Page Header -->
        <div class="page-header">
          <h1 class="page-title">Votaciones del Grupo</h1>
          <button class="create-btn" @click="goToCreateVoting">
            <span class="icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </span>
            <span>Crear Votación</span>
          </button>
        </div>

        <!-- Active Votings -->
        <section class="voting-section">
          <h2 class="section-title">Activas</h2>
          <div class="voting-grid">
            <VotingCard
              v-for="voting in activeVotings"
              :key="voting.id"
              :voting="voting"
              :isActive="true"
              @vote="handleVote"
            />
          </div>
        </section>

        <!-- Finished Votings -->
        <section class="voting-section">
          <h2 class="section-title">Finalizadas</h2>
          <div class="voting-grid">
            <VotingCard
              v-for="voting in finishedVotings"
              :key="voting.id"
              :voting="voting"
              :isActive="false"
              @viewResults="handleViewResults"
            />
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
// En modo dev, listamos votaciones desde trips/dev-trip/votaciones sin requerir Auth.
// Cuando RF6 (Autenticación) esté listo, reemplaza DEV_DEFAULT_TRIP_ID por el trip activo del usuario
// y mantén exactamente los mismos listeners.
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import VotingCard from '../components/voting/VotingCard.vue'
import { useRouter } from 'vue-router'
import { db } from '../firebase/firebaseConfig'
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore'
import { DEV_DEFAULT_TRIP_ID, SHOW_DEV_MOCK_VOTINGS } from '../config/devConfig'

const router = useRouter()

// Estado reactivo
const allVotings = ref([])
const nowTick = ref(Date.now())
const loading = ref(true)

// Mock para estética en dev (se mezclan con los reales si SHOW_DEV_MOCK_VOTINGS=true)
const mockActiveVotings = [
  {
    id: 'mock-a1',
    title: '¿Dónde deberíamos ir primero?',
    options: ['La Paz', 'Sucre', 'Cochabamba'],
    voters: ['Ana', 'Juan'],
    image:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=800&auto=format&fit=crop',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'mock-a2',
    title: '¿Qué tipo de alojamiento preferimos?',
    options: ['Hostal', 'Hotel', 'Airbnb'],
    voters: ['Carlos'],
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  }
]

const mockFinishedVotings = [
  {
    id: 'mock-f1',
    title: '¿Cuál es nuestro presupuesto por día?',
    results: { '50 USD': 45, '75 USD': 30, '100 USD': 25 },
    image:
      'https://images.unsplash.com/photo-1521540216272-a50305cd4421?q=80&w=800&auto=format&fit=crop'
  }
]

let unsubAll = null
let tickId = null

// Suscribir a Firestore en modo dev usando el trip por defecto
const loadVotings = () => {
  const base = collection(db, 'trips', DEV_DEFAULT_TRIP_ID, 'votaciones')

  // Mostrar mocks de inmediato para que no se vea vacío si hay error/índice faltante
  if (SHOW_DEV_MOCK_VOTINGS) {
    activeVotings.value = [...mockActiveVotings]
    finishedVotings.value = [...mockFinishedVotings]
    loading.value = false
  }

  // Suscripción única a toda la colección; luego se clasifica por deadline/status en el cliente
  const subscribeAll = (withOrderBy = true) => {
    try {
      const q = withOrderBy ? query(base, orderBy('deadline', 'asc')) : query(base)
      unsubAll = onSnapshot(
        q,
        (snap) => {
          const live = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          allVotings.value = live
          loading.value = false
        },
        (err) => {
          console.error('All votings snapshot error:', err?.code || err)
          if (withOrderBy) subscribeAll(false)
          else loading.value = false
        }
      )
    } catch (e) {
      console.error('All subscribe exception:', e)
      loading.value = false
    }
  }
  subscribeAll(true)
}

const openVoting = (votingId) => {
  try {
    const all = [...activeVotings.value, ...finishedVotings.value]
    const it = all.find(v => v.id === votingId)
    if (it && String(votingId).startsWith('mock-')) {
      sessionStorage.setItem('mockVoting', JSON.stringify(it))
    }
  } catch {}
  router.push(`/voting/${votingId}`)
}

const handleVote = (votingId) => openVoting(votingId)

const handleViewResults = (votingId) => openVoting(votingId)

const goToCreateVoting = () => {
  router.push('/voting/create')
}

// Lifecycle
onMounted(() => {
  loadVotings()
  // tick para que el pase de tiempo recalcule la clasificación (cada 60s)
  tickId = window.setInterval(() => (nowTick.value = Date.now()), 60000)
})

onBeforeUnmount(() => {
  if (unsubAll) unsubAll()
  if (tickId) window.clearInterval(tickId)
})

// Helpers comunes
const parseDeadline = (dl) => {
  try {
    if (!dl) return null
    if (typeof dl === 'string' || typeof dl === 'number') return new Date(dl)
    if (dl?.toDate) return dl.toDate()
    if (dl?.seconds != null) return new Date(dl.seconds * 1000)
    return dl instanceof Date ? dl : null
  } catch { return null }
}

// Computed para separar activas/finalizadas según tiempo real
const activeVotings = computed(() => {
  const now = nowTick.value
  const real = allVotings.value.filter(v => {
    const d = parseDeadline(v.deadline)
    const expired = d ? now >= d.getTime() : false
    return v.status !== 'finished' && !expired
  }).sort((a, b) => {
    const da = parseDeadline(a.deadline)?.getTime() || 0
    const db = parseDeadline(b.deadline)?.getTime() || 0
    return da - db
  })
  return (SHOW_DEV_MOCK_VOTINGS ? mockActiveVotings : []).concat(real)
})

const finishedVotings = computed(() => {
  const now = nowTick.value
  const real = allVotings.value.filter(v => {
    const d = parseDeadline(v.deadline)
    const expired = d ? now >= d.getTime() : false
    return v.status === 'finished' || expired
  }).sort((a, b) => {
    const da = parseDeadline(a.deadline)?.getTime() || 0
    const db = parseDeadline(b.deadline)?.getTime() || 0
    return da - db
  })
  return (SHOW_DEV_MOCK_VOTINGS ? mockFinishedVotings : []).concat(real)
})
</script>

<style scoped>
/* Container base */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Main Content */
.main-content {
  padding: 2rem 0;
  background-color: #f8fafc;
  min-height: calc(100vh - 4.5rem);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  color: #111827;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
  white-space: nowrap;
}

.create-btn:hover {
  background-color: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(37, 99, 235, 0.4);
}

.create-btn:active {
  transform: translateY(0);
}

/* Sections */
.voting-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e2e8f0;
  color: #1e293b;
}

.voting-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

.icon {
  font-size: 1rem;
}

/* Responsive */
@media (min-width: 640px) {
  .voting-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

@media (min-width: 768px) {
  .container {
    padding: 0 1.5rem;
  }
  
  .page-title {
    font-size: 2.25rem;
  }
  
  .main-content {
    padding: 2.5rem 0;
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 0 2rem;
  }
  
  .voting-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.75rem;
  }
  
  .page-title {
    font-size: 2.5rem;
  }
}

@media (min-width: 1280px) {
  .voting-grid {
    gap: 2rem;
  }
}
</style>
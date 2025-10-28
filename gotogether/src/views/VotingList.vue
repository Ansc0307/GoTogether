<!-- /views/VotingList.vue -->
<template>
  <div class="voting-list">
    <main class="main-content">
      <div class="container">
        <div class="page-header">
          <h1 class="page-title">Votaciones del Grupo</h1>
          <button class="create-btn" @click="goToCreateVoting">
            <span class="icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </span>
            <span>Crear Votación</span>
          </button>
        </div>

        <!-- ACTIVAS -->
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

        <!-- FINALIZADAS -->
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import VotingCard from '../components/voting/VotingCard.vue'
import { db } from '../firebase/firebaseConfig'
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore'
import { SHOW_DEV_MOCK_VOTINGS } from '../config/devConfig'

const router = useRouter()
const route = useRoute()
const tripId = route.params.id

// ---- Estado principal ----
const allVotings = ref([])
const votersMetaMap = ref({}) // { [votingId]: { names, count } }
const votesUnsubs = new Map()
const nowTick = ref(Date.now())
const loading = ref(true)

// ---- Datos mock opcionales ----
const mockActiveVotings = [
  { id: 'mock-a1', title: '¿Dónde deberíamos ir primero?', options: ['La Paz','Sucre','Cochabamba'], voters: ['Ana','Juan'], image:'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=800&auto=format&fit=crop', deadline: new Date(Date.now() + 2*24*60*60*1000) },
]
const mockFinishedVotings = [
  { id: 'mock-f1', title: '¿Cuál es nuestro presupuesto por día?', results: { '50 USD':45,'75 USD':30,'100 USD':25 }, image:'https://images.unsplash.com/photo-1521540216272-a50305cd4421?q=80&w=800&auto=format&fit=crop' }
]

// ---- Suscripción principal a votaciones ----
let unsubAll = null
let tickId = null

const loadVotings = () => {
  const base = collection(db, 'trips', tripId, 'votaciones')
  const subscribeAll = (withOrderBy = true) => {
    try {
      const q = withOrderBy ? query(base, orderBy('deadline','asc')) : query(base)
      unsubAll = onSnapshot(q, (snap) => {
        allVotings.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        loading.value = false
        ensureVotesSubscriptions()
      }, (err) => {
        console.error('All votings snapshot error:', err?.code || err)
        if (withOrderBy) subscribeAll(false)
        else loading.value = false
      })
    } catch (e) {
      console.error('All subscribe exception:', e)
      loading.value = false
    }
  }
  subscribeAll(true)
}

// ---- Subcolección de votos ----
const ensureVotesSubscriptions = () => {
  const ids = new Set(allVotings.value.map(v => v.id))
  // Limpiar suscripciones viejas
  for (const [id, un] of votesUnsubs.entries()) {
    if (!ids.has(id)) { try { un() } catch {} votesUnsubs.delete(id) }
  }
  // Suscribirse a nuevas
  allVotings.value.forEach(v => {
    if (votesUnsubs.has(v.id)) return
    try {
      const votesRef = collection(db, 'trips', tripId, 'votaciones', v.id, 'votes')
      const un = onSnapshot(votesRef, (snap) => {
        let count = 0
        const names = []
        snap.forEach(d => {
          const data = d.data()
          count += 1
          if (names.length < 3) {
            const name = data?.userName || data?.userEmail || d.id
            names.push(name)
          }
        })
        votersMetaMap.value = { ...votersMetaMap.value, [v.id]: { names, count } }
      })
      votesUnsubs.set(v.id, un)
    } catch (e) {
      console.warn('No se pudo suscribir a votes para', v.id, e)
    }
  })
}

onMounted(() => {
  loadVotings()
  tickId = window.setInterval(() => (nowTick.value = Date.now()), 60000)
})
onBeforeUnmount(() => {
  if (unsubAll) unsubAll()
  if (tickId) window.clearInterval(tickId)
  for (const un of votesUnsubs.values()) { try { un() } catch {} }
  votesUnsubs.clear()
})

// ---- Utils ----
const parseDeadline = (dl) => {
  try {
    if (!dl) return null
    if (typeof dl === 'string' || typeof dl === 'number') return new Date(dl)
    if (dl?.toDate) return dl.toDate()
    if (dl?.seconds != null) return new Date(dl.seconds * 1000)
    return dl instanceof Date ? dl : null
  } catch { return null }
}

// ---- Computed ----
const activeVotings = computed(() => {
  const now = nowTick.value
  const real = allVotings.value.filter(v => {
    const d = parseDeadline(v.deadline)
    const expired = d ? now >= d.getTime() : false
    return v.status !== 'finished' && !expired
  }).sort((a,b) => (parseDeadline(a.deadline)?.getTime()||0) - (parseDeadline(b.deadline)?.getTime()||0))
  const mapped = real.map(v => ({
    ...v,
    voters: votersMetaMap.value[v.id]?.names || [],
    votersCount: votersMetaMap.value[v.id]?.count || 0
  }))
  return (SHOW_DEV_MOCK_VOTINGS ? mockActiveVotings : []).concat(mapped)
})

const finishedVotings = computed(() => {
  const now = nowTick.value
  const real = allVotings.value.filter(v => {
    const d = parseDeadline(v.deadline)
    const expired = d ? now >= d.getTime() : false
    return v.status === 'finished' || expired
  }).sort((a,b) => (parseDeadline(a.deadline)?.getTime()||0) - (parseDeadline(b.deadline)?.getTime()||0))
  const mapped = real.map(v => ({
    ...v,
    voters: votersMetaMap.value[v.id]?.names || [],
    votersCount: votersMetaMap.value[v.id]?.count || 0
  }))
  return (SHOW_DEV_MOCK_VOTINGS ? mockFinishedVotings : []).concat(mapped)
})

// ---- Navegación ----
const openVoting = (votingId) => {
  try {
    const all = [...activeVotings.value, ...finishedVotings.value]
    const it = all.find(v => v.id === votingId)
    if (it && String(votingId).startsWith('mock-')) {
      sessionStorage.setItem('mockVoting', JSON.stringify(it))
    }
  } catch {}
  router.push(`/trips/${tripId}/votaciones/${votingId}`)
}

const handleVote = (id) => openVoting(id)
const handleViewResults = (id) => openVoting(id)
const goToCreateVoting = () => router.push(`/trips/${tripId}/votaciones/create`)

</script>

<style scoped>
.container { max-width:1200px; margin:0 auto; padding:0 1rem }
.main-content { padding:2rem 0; background:#f8fafc; min-height:calc(100vh - 4.5rem) }
.page-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:2rem; gap:1rem; flex-wrap:wrap }
.page-title { font-size:2rem; font-weight:800; margin:0; color:#111827 }
.create-btn { display:flex; align-items:center; gap:.5rem; background:#2563eb; color:white; border:none; padding:.875rem 1.5rem; border-radius:.5rem; font-weight:600; font-size:.875rem; cursor:pointer; transition:.2s; box-shadow:0 4px 6px -1px rgba(37,99,235,.3) }
.create-btn:hover { background:#1d4ed8; transform:translateY(-1px) }
.voting-section { margin-bottom:3rem }
.section-title { font-size:1.5rem; font-weight:700; margin-bottom:1.5rem; padding-bottom:.75rem; border-bottom:2px solid #e2e8f0; color:#1e293b }
.voting-grid { display:grid; grid-template-columns:1fr; gap:1.25rem }
@media (min-width:640px){ .voting-grid{ grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)) } }
@media (min-width:1024px){ .voting-grid{ grid-template-columns:repeat(2, 1fr); gap:1.75rem } .page-title{ font-size:2.5rem } }
</style>

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
import { ref, onMounted } from 'vue'
import VotingCard from '../components/voting/VotingCard.vue'
import { useRouter } from 'vue-router'
import { db } from '../firebase/firebaseConfig'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'

const router = useRouter()

// Estado reactivo
const activeVotings = ref([])
const finishedVotings = ref([])
const loading = ref(true)

// Datos de ejemplo (luego reemplazar con Firebase)
const mockActiveVotings = [
  {
    id: 1,
    title: "¿Dónde deberíamos ir primero?",
    options: ["La Paz", "Sucre", "Cochabamba"],
    voters: ["Ana", "Juan"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBGifuBo5txj9DhdCXZe3OM-RtK3NhdjTsVGWMLQPlWfmChcHplYyhrvWEkljEvBmJOqyJDYDK8WjHbskWix6GrgoLwbKOvQP9WwvIKfbZCf-KQVQ_XO2c3TsZo_6mIu1ryQ1lsLimMzA1_UsYFhchzdGRgKtFpnaBl9vgNzQ0HMR0o957_OpNja-5ro2bemiXfI8-kLHTwtbeBLM0ul48c9e52GfNEkoji5ZJsCNWVMWZCJJ4v2xSyAxnKzQw8hD6CSRFcidor83o",
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 días
  },
  {
    id: 2,
    title: "¿Qué tipo de alojamiento preferimos?",
    options: ["Hostal", "Hotel", "Airbnb"],
    voters: ["Carlos"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBjWeYnKMIJeI4y9bObZZ-NPZYUvQVP1JnuvxtxPgr9OhQAXemH5iaGijUm1RPSqYKEnPOQDNZ4pIA5_CahNc62zWGFtcRjIgvrLlVR5cGk9UYVeEU-Hhfbzl6kOMfHOnnJ6xjtaUXE7qNDpWpw0AH-CZRaz9qUqUeVP7lDDfdyp158Ru7_HIIOQyTt-xxGGgH8PeTNNUznOvL50UwIDoNq9fBdxPRLdpvanDZMpT8fkPwccZnvW120SbIr58Jth5dhqnFJoqbTpQs",
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 días
  }
]

const mockFinishedVotings = [
  {
    id: 3,
    title: "¿Cuál es nuestro presupuesto por día?",
    results: {
      "50 USD": 45,
      "75 USD": 30,
      "100 USD": 25
    },
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBYahEwjRU1k5JbTPykK3LndNU3LwrSOivbPD2JdMOY08qz0FTXf4IlEaO8Ogmoj3rhrufq2kPfMkQCusLLhJEsF6qdXcasoDDXKqWYXMP5m3vG-dhurwNB1rna5wLNYgsf0lcerv1xBO725WVOvZ6oyL1m0iEAvH_hUaTDLUW0y70iuQMossAPZdCW10mVESoUXYwLkdAufQYaYfE6iqBd8fkIg2o735FPIn4uVcZJ57J1vXKyqTf2n2ApYb0TxKN_iL1T1oL_QO4"
  }
]

// Métodos
const loadVotings = () => {
  // Simulamos carga de datos
  activeVotings.value = mockActiveVotings
  finishedVotings.value = mockFinishedVotings
  loading.value = false
}

const handleVote = (votingId) => {
  router.push(`/voting/${votingId}`)
}

const handleViewResults = (votingId) => {
  router.push(`/voting/${votingId}`)
}

const goToCreateVoting = () => {
  router.push('/voting/create')
}

// Lifecycle
onMounted(() => {
  loadVotings()
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
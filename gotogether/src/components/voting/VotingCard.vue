<!-- /components/voting/VoringCard.vue -->
<template>
  <div class="voting-card" :class="{ 'finished': !isActive }">
    <div class="card-layout">
      <!-- Image Section -->
      <div class="image-section">
        <img 
          :src="voting.image || defaultImage" 
          :alt="voting.title"
          class="voting-image"
        />
      </div>
      
      <!-- Content Section -->
      <div class="content-section">
        <div class="card-content">
          <!-- Title -->
          <h3 class="voting-title">{{ voting.title }}</h3>
          
          <!-- Options or Results -->
          <div class="voting-info">
            <p v-if="isActive" class="options-text">
              Opciones: {{ formatOptions(voting.options) }}
            </p>
            <p v-else class="results-text">
              Resultados: {{ formatResults(voting.results) }}
            </p>
          </div>
          
          <!-- Voters (active: avatars + count, finished: only count) and deadline info -->
          <div v-if="isActive" class="voters-info">
            <div class="voters-row">
              <div class="avatars" v-if="(voting.voters || []).length">
                <span
                  v-for="(name, idx) in (voting.voters || []).slice(0,3)"
                  :key="idx"
                  class="avatar"
                  :style="{ backgroundColor: avatarBg(idx) }"
                  :title="name"
                >{{ initials(name) }}</span>
                <span v-if="(voting.voters || []).length > 3" class="more">+{{ (voting.voters || []).length - 3 }}</span>
              </div>
              <span class="voters-count">{{ voterCount }} votantes</span>
            </div>
            <div v-if="voting.deadline" class="deadline-row">
              <span class="deadline-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </span>
              <span class="deadline-label">Cierra:</span>
              <time class="deadline-date">{{ formatDeadlineAbsolute(voting.deadline) }}</time>
              <span class="deadline-remaining">({{ formatDeadlineRelative(voting.deadline) }})</span>
            </div>
          </div>
          <div v-else class="voters-info finished">
            <span class="voters-count">{{ voterCount }} votantes</span>
          </div>
        </div>
        
        <!-- Action Button -->
        <button 
          class="action-btn"
          :class="{ 'vote-btn': isActive, 'results-btn': !isActive }"
          @click="handleAction"
        >
          <span class="btn-icon">
            <!-- Icono de Votar -->
            <svg v-if="isActive" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <!-- Icono de Ver Resultados -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </span>
          <span class="btn-text">{{ isActive ? 'Votar' : 'Ver Resultados' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  voting: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['vote', 'viewResults'])

// Computed
const defaultImage = computed(() => 
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop'
)

const voterCount = computed(() => props.voting?.votersCount ?? ((props.voting?.voters || []).length))

// Methods
const formatOptions = (options) => {
  if (!options || options.length === 0) return 'Sin opciones'
  return options.slice(0, 3).join(', ') + (options.length > 3 ? '...' : '')
}

const formatResults = (results) => {
  if (!results) return 'Sin resultados'
  const entries = Object.entries(results)
  if (entries.length === 0) return 'Sin resultados'
  
  return entries
    .slice(0, 2)
    .map(([option, percentage]) => `${option} (${percentage}%)`)
    .join(', ') + (entries.length > 2 ? '...' : '')
}

const initials = (name = '') => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0,2)
    .map(n => n[0]?.toUpperCase())
    .join('') || 'U'
}

const palette = ['#DBEAFE', '#FDE68A', '#FBCFE8', '#BBF7D0', '#FCA5A5']
const avatarBg = (idx = 0) => palette[idx % palette.length]

const formatDeadlineRelative = (deadline) => {
  if (!deadline) return ''
  // Soporta Date, string/number y Firestore Timestamp
  let d
  if (typeof deadline === 'string' || typeof deadline === 'number') {
    d = new Date(deadline)
  } else if (deadline?.toDate) {
    d = deadline.toDate()
  } else if (deadline?.seconds != null) {
    d = new Date(deadline.seconds * 1000)
  } else {
    d = deadline
  }
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  if (diff <= 0) return 'Finalizada'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0) return `${days}d ${hours}h restantes`
  if (hours > 0) return `${hours}h restantes`
  const mins = Math.max(1, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)))
  return `${mins}m`
}

const formatDeadlineAbsolute = (deadline) => {
  // Soporta Date, string/number y Firestore Timestamp
  let d
  if (typeof deadline === 'string' || typeof deadline === 'number') {
    d = new Date(deadline)
  } else if (deadline?.toDate) {
    d = deadline.toDate()
  } else if (deadline?.seconds != null) {
    d = new Date(deadline.seconds * 1000)
  } else {
    d = deadline
  }
  const date = d.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const time = d.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${date} ${time}`
}

const handleAction = () => {
  if (props.isActive) {
    emit('vote', props.voting.id)
  } else {
    emit('viewResults', props.voting.id)
  }
}
</script>

<style scoped>
.voting-card {
  background: #ffffff;
  border-radius: 0.875rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.voting-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(-4px);
  border-color: #cbd5e1;
}

.voting-card.finished {
  opacity: 0.7;
  background: #f8fafc;
}

.card-layout {
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* Image Section */
.image-section {
  width: 100%;
  height: 12rem;
  overflow: hidden;
  border-radius: 0.875rem 0.875rem 0 0;
}

.voting-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.voting-card:hover .voting-image {
  transform: scale(1.05);
}

/* Content Section */
.content-section {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
}

.card-content {
  flex-grow: 1;
}

.voting-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.875rem 0;
  line-height: 1.4;
}

.voting-info {
  margin-bottom: 0.875rem;
}

.options-text,
.results-text {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
}

.voters-info { margin-bottom: 1rem; display:flex; flex-direction:column; gap:.5rem }
.voters-row { display:flex; align-items:center; gap:.5rem }
.avatars { display:flex; align-items:center }
.avatar { width:22px; height:22px; border-radius:999px; display:inline-flex; align-items:center; justify-content:center; font-size:.65rem; font-weight:700; color:#0f172a; border:1px solid #e2e8f0; margin-right:-6px }
.more { margin-left:8px; font-size:.75rem; color:#475569 }
.voters-count { font-size:.75rem; color:#64748b }

.deadline-row { display:flex; align-items:center; gap:.4rem; font-size:.8rem }
.deadline-icon { color:#ef4444; display:inline-flex }
.deadline-label { color:#ef4444; font-weight:700 }
.deadline-date { color:#0f172a }
.deadline-remaining { color:#475569 }

/* Action Button */
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.vote-btn {
  background-color: #dbeafe;
  color: #1e40af;
}

.vote-btn:hover {
  background-color: #bfdbfe;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
}

.results-btn {
  background-color: #f1f5f9;
  color: #64748b;
}

.results-btn:hover:not(:disabled) {
  background-color: #e2e8f0;
  transform: translateY(-1px);
}

.results-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.btn-icon svg {
  width: 100%;
  height: 100%;
}

.btn-text {
  font-size: 0.875rem;
  font-weight: 500;
}

/* Responsive Design */
@media (min-width: 640px) {
  .voting-title {
    font-size: 1.125rem;
  }
}

@media (min-width: 768px) {
  .card-layout {
    flex-direction: row;
    height: 13rem;
  }
  
  .image-section {
    width: 13rem;
    height: 100%;
    flex-shrink: 0;
  }
  
  .content-section {
    flex: 1;
    padding: 1.75rem;
  }
  
  .voting-title {
    font-size: 1.25rem;
  }
}

@media (min-width: 1024px) {
  .card-layout {
    height: 14rem;
  }
  
  .image-section {
    width: 14rem;
  }
}
</style>
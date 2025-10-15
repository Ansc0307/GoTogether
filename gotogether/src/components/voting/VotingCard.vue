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
          
          <!-- Voters (for active) or deadline info -->
          <div v-if="isActive" class="voters-info">
            <p class="voters-text">
              Votaron: {{ formatVoters(voting.voters) }}
            </p>
            <p v-if="voting.deadline" class="deadline-text">
              Cierra: {{ formatDeadline(voting.deadline) }}
            </p>
          </div>
        </div>
        
        <!-- Action Button -->
        <button 
          class="action-btn"
          :class="{ 'vote-btn': isActive, 'results-btn': !isActive }"
          @click="handleAction"
          :disabled="!isActive && !voting.results"
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

const formatVoters = (voters) => {
  if (!voters || voters.length === 0) return 'Nadie aún'
  return voters.slice(0, 3).join(', ') + (voters.length > 3 ? `... +${voters.length - 3}` : '')
}

const formatDeadline = (deadline) => {
  if (!deadline) return ''
  
  const now = new Date()
  const diff = deadline - now
  
  if (diff <= 0) return 'Finalizada'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) {
    return `${days}d ${hours}h restantes`
  } else if (hours > 0) {
    return `${hours}h restantes`
  } else {
    return 'Menos de 1h'
  }
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

.voters-info {
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.voters-text {
  color: #94a3b8;
  font-size: 0.75rem;
  margin: 0;
  line-height: 1.4;
}

.deadline-text {
  color: #dc2626;
  font-size: 0.75rem;
  font-weight: 600;
  margin: 0;
  background: #fee2e2;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  display: inline-block;
  white-space: nowrap;
  overflow: visible;
}

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
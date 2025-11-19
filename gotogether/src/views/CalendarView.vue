<template>
  <div class="p-4 w-full max-w-[1500px] mx-auto">

    <!-- Botones de vista -->
  

    <!-- Contenedor dinámico -->
    <div class="w-full overflow-x-auto">
      <component
  :is="viewComponent"
  :events="events"
  :tripId="tripId"
  @changeView="currentView = $event"
/>

    </div>

    

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '../firebase/firebaseConfig'
import { collection, query, where, getDocs } from 'firebase/firestore'

import DayView from '../components/calendar/DayView.vue'
import WeekView from '../components/calendar/WeekView.vue'
import MonthView from '../components/calendar/MonthView.vue'

const props = defineProps({
  tripId: String
})

const currentView = ref('week')
const events = ref([])

const viewComponent = computed(() => {
  switch (currentView.value) {
    case 'day': return DayView
    case 'week': return WeekView
    case 'month': return MonthView
    default: return WeekView
  }
})

const btnClass = view => `
  px-4 py-2 whitespace-nowrap rounded-lg font-semibold
  ${currentView.value===view
    ? 'bg-primary text-white'
    : 'bg-gray-200 text-gray-700 dark:bg-slate-800 dark:text-gray-300'}
`

// Cargar eventos
const fetchEvents = async () => {
  if (!props.tripId) return

  const types = ['tareas', 'votaciones', 'trips']
  let allEvents = []

  for (const type of types) {
    const q = query(collection(db, type), where("tripId", "==", props.tripId))
    const snapshot = await getDocs(q)

    snapshot.forEach(doc => {
      const data = doc.data()
      allEvents.push({
        id: doc.id,
        type,
        title: data.nombre || data.title || data.name,
        start: data.fechaLimite?.toDate?.() || data.startDate || new Date(),
        end: data.endDate || data.fechaLimite?.toDate?.() || new Date(),
      })
    })
  }

  events.value = allEvents
}

onMounted(fetchEvents)
</script>

<style scoped>
/* Mejor soporte móvil */
@media (max-width: 600px) {
  button {
    font-size: 0.85rem;
  }
}
</style>

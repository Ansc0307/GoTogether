<template>
  <div class="p-4 max-w-7xl mx-auto">
    <!-- Botones de vista -->
    <div class="flex gap-2 mb-4">
      <button @click="currentView='day'" :class="btnClass('day')">Día</button>
      <button @click="currentView='week'" :class="btnClass('week')">Semana</button>
      <button @click="currentView='month'" :class="btnClass('month')">Mes</button>
    </div>

    <!-- Contenedor dinámico de vista -->
    <component :is="viewComponent" 
               :events="events"
               :tripId="tripId"
    />
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
  switch(currentView.value) {
    case 'day': return DayView
    case 'week': return WeekView
    case 'month': return MonthView
    default: return WeekView
  }
})

const btnClass = (view) => `
  px-4 py-2 rounded-lg font-semibold ${currentView.value===view?'bg-primary text-white':'bg-gray-100 text-gray-700'}
`

// Función para cargar eventos desde Firebase
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

<template>
  <div class="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 shadow-sm flex flex-col">

    <!-- Header -->
    <header class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
  
      <!-- Izquierda (flechas + mes) -->
      <div class="flex items-center gap-3">
        <button @click="previousWeek">
          <span class="material-symbols-outlined">chevron_left</span>
        </button>

        <h2 class="text-lg font-bold">
          {{ monthName }} {{ currentYear }}
        </h2>

        <button @click="nextWeek">
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      <!-- 🔥 Botones Día/Semana/Mes -->
      <CalendarViewSwitcher
        :current="'week'"
        @change="$emit('changeView', $event)"
      />
    </header>

    <!-- Grid Header -->
    <div class="grid grid-cols-7 border-b border-gray-200">
      <div
        v-for="(d, i) in weekDays"
        :key="i"
        class="text-center p-3 border-l border-gray-200 first:border-l-0"
      >
        <p class="text-xs font-bold text-gray-500 tracking-wide">
          {{ d.label }}
        </p>
        <p class="text-lg font-medium" :class="{'text-primary font-bold': d.isToday}">
          {{ d.day }}
        </p>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-7 flex-1 min-h-[500px] relative bg-white">

      <!-- Background rows -->
      <div class="col-span-full row-start-1 grid">
        <div
          v-for="i in 9"
          :key="i"
          class="h-16 border-b border-gray-200"
        ></div>
      </div>

      <!-- Vertical borders -->
      <div
        v-for="i in 7"
        :key="'border-'+i"
        class="col-start-1 row-start-1 border-l border-gray-200"
        :style="{ gridColumnStart: i }"
      ></div>

      <!-- EVENTS UNIFICADOS -->
      <div class="absolute inset-0 p-2 grid grid-cols-7 auto-rows-[48px] gap-1 overflow-hidden">

       <div
  v-for="(event, i) in positionedEvents"
  :key="i"
  :style="{
    gridColumnStart: event.col,
    gridRowStart: event.row
  }"
>
  <div
    class="h-full p-2 rounded-r-lg border-l-4 flex flex-col overflow-hidden"
    :class="event.style"
  >
    <p class="font-bold text-xs truncate">{{ event.title }}</p>
    <p class="text-xs">
      <span v-for="(line, index) in event.subtitle" :key="index" class="block truncate">
        {{ line }}
      </span>
    </p>
  </div>
</div>


      </div>

    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useCalendarData } from '@/composables/useCalendarData'
import CalendarViewSwitcher from '@/components/calendar/CalendarViewSwitcher.vue'

// ========================================
// Firebase composable
// ========================================
const { tareas, trips, votes, loadTasks, loadTrips, loadVotes } = useCalendarData()

const auth = getAuth()
const currentDate = ref(new Date())

onMounted(() => {
  onAuthStateChanged(auth, user => {
    if (user) {
      loadTasks(user.email)
      loadTrips(user.email)
      loadVotes(user.email)
    }
  })
})

// ========================================
// Calendar Metadata
// ========================================
const monthName = computed(() =>
  currentDate.value.toLocaleDateString('es-ES', { month: 'long' })
)

const currentYear = computed(() => currentDate.value.getFullYear())

const previousWeek = () => {
  currentDate.value = new Date(
    currentDate.value.setDate(currentDate.value.getDate() - 7)
  )
}

const nextWeek = () => {
  currentDate.value = new Date(
    currentDate.value.setDate(currentDate.value.getDate() + 7)
  )
}

// ========================================
// Generate week days (Mon - Sun)
// ========================================
const weekDays = computed(() => {
  const start = new Date(currentDate.value)
  const day = start.getDay()

  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)

  const days = []

  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)

    days.push({
      date: d,
      day: d.getDate(),
      label: d.toLocaleDateString('es-ES', { weekday: 'short' }),
      isToday: d.toDateString() === new Date().toDateString()
    })
  }

  return days
})

// ========================================
// Filter Week Tasks
// ========================================
const weekTasks = computed(() => {
  if (!tareas.value) return []

  return tareas.value
    .filter(t => t.fechaLimite instanceof Date)
    .filter(t =>
      weekDays.value.some(d => t.fechaLimite.toDateString() === d.date.toDateString())
    )
    .map(t => ({
      title: t.nombre,
      subtitle: [
        "Fecha límite: " + t.fechaLimite.toLocaleDateString(),
        t.tripName ? "Destino: " + t.tripName : null
      ].filter(Boolean),
      col: weekDays.value.findIndex(d =>
        d.date.toDateString() === t.fechaLimite.toDateString()
      ) + 1,
      style: "bg-primary/10 border-primary text-primary"
    }))
})
// ========================================
// Filter Week Trips
// ========================================
const weekTripDays = computed(() => {
  if (!trips.value) return []

  return trips.value
    .filter(t => t.date instanceof Date)
    .filter(t =>
      weekDays.value.some(d => t.date.toDateString() === d.date.toDateString())
    )
    .map(t => ({
      title: t.name,
      subtitle: [
        "Día del viaje: " + t.date.toLocaleDateString(),
        t.destination ? "Destino: " + t.destination : null
      ].filter(Boolean),
      col: weekDays.value.findIndex(d =>
        d.date.toDateString() === t.date.toDateString()
      ) + 1,
      style: "bg-green-100 border-green-500 text-green-700"
    }))
})


// ========================================
// Filter Week Votes
// ========================================
const weekVotes = computed(() => {
  if (!votes.value) return []

  return votes.value
    .filter(v => v.deadline instanceof Date)
    .filter(v =>
      weekDays.value.some(d => v.deadline.toDateString() === d.date.toDateString())
    )
    .map(v => ({
      title: v.title,
      subtitle: [
        "Deadline: " + v.deadline.toLocaleDateString(),
        v.tripName ? "Destino: " + v.tripName : null
      ].filter(Boolean),
      col: weekDays.value.findIndex(d =>
        d.date.toDateString() === v.deadline.toDateString()
      ) + 1,
      style: "bg-yellow-100 border-yellow-500 text-yellow-700"
    }))
})

// ========================================
// UNIFICAR Y POSICIONAR EVENTOS DINÁMICAMENTE
// ========================================
const positionedEvents = computed(() => {
  const events = [
    ...weekTasks.value,
    ...weekTripDays.value,
    ...weekVotes.value
  ]

  const columns = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] }

  events.forEach(ev => {
    columns[ev.col].push(ev)
  })

  const positioned = []

  Object.keys(columns).forEach(col => {
    const colEvents = columns[col]

    colEvents.forEach((ev, index) => {
      positioned.push({
        ...ev,
        row: index + 2 // fila 2 y hacia abajo
      })
    })
  })

  return positioned
})
</script>

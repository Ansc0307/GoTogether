<template>
  <div class="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 shadow-sm flex flex-col">

    <!-- Header -->
    <header class="flex items-center justify-between p-4 border-b border-gray-200">
      <div class="flex items-center gap-3">
        <button
          class="text-gray-500 hover:bg-gray-100 flex size-9 items-center justify-center rounded-lg"
          @click="previousMonth"
        >
          <span class="material-symbols-outlined">chevron_left</span>
        </button>

        <h2 class="text-lg font-bold capitalize">
          {{ monthName }} {{ currentYear }}
        </h2>

        <button
          class="text-gray-500 hover:bg-gray-100 flex size-9 items-center justify-center rounded-lg"
          @click="nextMonth"
        >
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      <div class="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
        <button
          class="h-8 px-3 text-sm font-medium hover:bg-white hover:text-gray-900"
          @click="$emit('changeView', 'day')"
        >
          Día
        </button>

        <button
          class="h-8 px-3 text-sm font-medium hover:bg-white hover:text-gray-900"
          @click="$emit('changeView', 'week')"
        >
          Semana
        </button>

        <button
          class="h-8 px-3 text-sm font-bold bg-white rounded-md shadow-sm"
        >
          Mes
        </button>
      </div>
    </header>

    <!-- Grid -->
    <div class="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
      <div
        v-for="d in weekLabels"
        :key="d"
        class="text-center p-3 border-l border-gray-200 first:border-l-0 text-xs font-bold uppercase tracking-wide text-gray-500"
      >
        {{ d }}
      </div>
    </div>

    <!-- Days Grid -->
    <div class="grid grid-cols-7 flex-1 bg-white min-h-[600px]">

      <div
        v-for="(d, i) in monthDays"
        :key="i"
        class="border border-gray-200 p-1 sm:p-2 relative"
        :class="{
          'bg-gray-100 text-gray-500': d.otherMonth,
          'bg-blue-50 border-primary font-bold': d.isToday
        }"
      >
        <p class="text-right text-[0.7rem] sm:text-sm pr-1">{{ d.date.getDate() }}</p>

        <!-- Events: contenedor con altura máxima y scroll para cuándo hay mucho texto -->
        <div class="mt-1 space-y-1 max-h-28 sm:max-h-36 md:max-h-44 overflow-auto pr-1">

          <!-- Tareas -->
          <div
            v-for="(t, idx) in d.tasks"
            :key="'t-'+idx"
            class="bg-blue-100 border-l-4 border-blue-500 px-1 py-0.5 rounded-r text-[0.62rem] sm:text-xs text-blue-800 leading-tight break-words"
            title=" {{ t.nombre }}"
          >
            {{ t.nombre }}
          </div>

          <!-- Trips -->
          <div
            v-for="(tr, idx) in d.trips"
            :key="'tr-'+idx"
            class="bg-green-100 border-l-4 border-green-500 px-1 py-0.5 rounded-r text-[0.62rem] sm:text-xs text-green-700 leading-tight break-words"
            title=" {{ tr.name }}"
          >
            {{ tr.name }}
          </div>

          <!-- Votes -->
          <div
            v-for="(v, idx) in d.votes"
            :key="'v-'+idx"
            class="bg-yellow-100 border-l-4 border-yellow-500 px-1 py-0.5 rounded-r text-[0.62rem] sm:text-xs text-yellow-700 leading-tight break-words"
            title=" {{ v.title }}"
          >
            {{ v.title }}
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

/* ===========================
 NAVIGATION
=========================== */
const previousMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  )
}
const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
}

/* ===========================
 CALENDAR HEADER
=========================== */
const monthName = computed(() =>
  currentDate.value.toLocaleDateString('es-ES', { month: 'long' })
)
const currentYear = computed(() =>
  currentDate.value.getFullYear()
)

const weekLabels = [
  'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'
]

/* ===========================
 MONTH DAYS GRID
=========================== */
const monthDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const startOffset = (firstDay.getDay() + 6) % 7
  const totalDays = lastDay.getDate()

  const grid = []

  for (let i = 0; i < 42; i++) {
    const date = new Date(year, month, i - startOffset + 1)

    const sameMonth = date.getMonth() === month
    const isToday = date.toDateString() === new Date().toDateString()

    /* EVENTS FOR THIS DAY */
    const dayTasks = (tareas.value || [])
      .filter(t => t.fechaLimite instanceof Date)
      .filter(t => t.fechaLimite.toDateString() === date.toDateString())

    const dayTrips = (trips.value || [])
      .filter(tr => tr.date instanceof Date)
      .filter(tr => tr.date.toDateString() === date.toDateString())

    const dayVotes = (votes.value || [])
      .filter(v => v.deadline instanceof Date)
      .filter(v => v.deadline.toDateString() === date.toDateString())

    grid.push({
      date,
      otherMonth: !sameMonth,
      isToday,
      tasks: dayTasks,
      trips: dayTrips,
      votes: dayVotes
    })
  }

  return grid
})
</script>

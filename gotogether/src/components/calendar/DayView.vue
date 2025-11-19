<template>
  <div class="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 shadow-sm flex flex-col">

    <!-- Header -->
    <header class="flex items-center justify-between p-4 border-b border-gray-200">
      <div class="flex items-center gap-3">
        <button
          class="text-gray-500 hover:bg-gray-100 flex size-9 items-center justify-center rounded-lg"
          @click="previousDay"
        >
          <span class="material-symbols-outlined">chevron_left</span>
        </button>

        <h2 class="text-lg font-bold capitalize">
          {{ currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month:'long', year:'numeric' }) }}
        </h2>

        <button
          class="text-gray-500 hover:bg-gray-100 flex size-9 items-center justify-center rounded-lg"
          @click="nextDay"
        >
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      <div class="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
        <button
          class="h-8 px-3 text-sm font-bold bg-white rounded-md shadow-sm"
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
          class="h-8 px-3 text-sm font-medium hover:bg-white hover:text-gray-900"
          @click="$emit('changeView', 'month')"
        >
          Mes
        </button>
      </div>
    </header>


    <!-- CONTENT -->
    <div class="flex-1 p-6 space-y-6">

      <!-- TAREAS -->
      <section>
        <h3 class="text-lg font-semibold mb-3">📝 Tareas</h3>

        <div v-if="dayTasks.length === 0" class="text-gray-500 text-sm">
          No hay tareas para hoy.
        </div>

        <div
          v-for="(t, i) in dayTasks"
          :key="'t-'+i"
          class="bg-blue-100 border-l-4 border-blue-500 p-3 rounded-r-lg mb-2"
        >
          <p class="font-bold text-blue-800">{{ t.nombre }}</p>
          <p class="text-xs text-blue-700">
            Fecha límite: {{ t.fechaLimite.toLocaleDateString() }}
            Destino: {{ t.tripName }}
          </p>
        </div>
      </section>


      <!-- TRIPS -->
      <section>
        <h3 class="text-lg font-semibold mb-3">✈️ Viajes</h3>

        <div v-if="dayTrips.length === 0" class="text-gray-500 text-sm">
          No hay viajes en esta fecha.
        </div>

        <div
          v-for="(tr, i) in dayTrips"
          :key="'trip-'+i"
          class="bg-green-100 border-l-4 border-green-500 p-3 rounded-r-lg mb-2"
        >
          <p class="font-bold text-green-700">{{ tr.name }}</p>
          <p class="text-xs text-green-700">
            Día del viaje: {{ tr.date.toLocaleDateString() }}
          </p>
        </div>
      </section>


      <!-- VOTES -->
      <section>
        <h3 class="text-lg font-semibold mb-3">🗳️ Votaciones</h3>

        <div v-if="dayVotes.length === 0" class="text-gray-500 text-sm">
          No hay votaciones con deadline hoy.
        </div>

        <div
          v-for="(v, i) in dayVotes"
          :key="'vote-'+i"
          class="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded-r-lg mb-2"
        >
          <p class="font-bold text-yellow-700">{{ v.title }}</p>
          <p class="text-xs text-yellow-700">
            Deadline: {{ v.deadline.toLocaleDateString() }} 
          
  <span v-if="v.tripName">- Destino: {{ v.tripName }}</span>

          </p>
        </div>
      </section>

    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useCalendarData } from '@/composables/useCalendarData'
import CalendarViewSwitcher from '@/components/calendar/CalendarViewSwitcher.vue'

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

/* ======================================
  NAVIGATION DAY BY DAY
====================================== */
const previousDay = () => {
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() - 1)
  currentDate.value = d
}

const nextDay = () => {
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() + 1)
  currentDate.value = d
}

/* ======================================
  DATA FOR THIS DAY
====================================== */
const dayTasks = computed(() =>
  (tareas.value || [])
    .filter(t => t.fechaLimite instanceof Date)
    .filter(t => t.fechaLimite.toDateString() === currentDate.value.toDateString())
)

const dayTrips = computed(() =>
  (trips.value || [])
    .filter(tr => tr.date instanceof Date)
    .filter(tr => tr.date.toDateString() === currentDate.value.toDateString())
)

const dayVotes = computed(() =>
  (votes.value || [])
    .filter(v => v.deadline instanceof Date)
    .filter(v => v.deadline.toDateString() === currentDate.value.toDateString())
)
</script>

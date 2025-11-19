<template>
  <div class="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 shadow-sm flex flex-col">

    <!-- Header -->
    <header class="flex items-center justify-between p-4 border-b border-gray-200">
      <div class="flex items-center gap-3">
        <button
          class="text-gray-500 hover:bg-gray-100 flex size-9 items-center justify-center rounded-lg"
          @click="previousWeek"
        >
          <span class="material-symbols-outlined">chevron_left</span>
        </button>

        <h2 class="text-lg font-bold">
          {{ monthName }} {{ currentYear }}
        </h2>

        <button
          class="text-gray-500 hover:bg-gray-100 flex size-9 items-center justify-center rounded-lg"
          @click="nextWeek"
        >
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      <div class="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
        <button
          class="h-8 px-3 text-sm font-medium rounded-md hover:bg-white hover:text-gray-900"
          @click="$emit('changeView', 'day')"
        >
          Día
        </button>

        <button
          class="h-8 px-3 text-sm font-bold bg-white rounded-md shadow-sm"
        >
          Semana
        </button>

        <button
          class="h-8 px-3 text-sm font-medium text-gray-600 rounded-md hover:bg-white hover:text-gray-900"
          @click="$emit('changeView', 'month')"
        >
          Mes
        </button>
      </div>
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

      <!-- EVENTOS: tareas -->
      <div class="absolute inset-0 p-2 grid grid-cols-7 gap-1">

        <div
          v-for="(tarea, i) in weekTasks"
          :key="'tarea-'+i"
          class="col-start-1"
          :style="{ gridColumnStart: tarea.col }"
        >
          <div
            class="mt-6 h-20 bg-primary/10 border-l-4 border-primary p-2 rounded-r-lg"
          >
            <p class="font-bold text-sm text-primary">{{ tarea.nombre }}</p>
            <p class="text-xs text-primary">
              Fecha límite: {{ tarea.fechaLimite.toLocaleDateString() }}
            </p>
          </div>
        </div>

        <!-- EVENTOS: trips -->
        <div
          v-for="(dia, i) in weekTripDays"
          :key="'trip-'+i"
          class="col-start-1"
          :style="{ gridColumnStart: dia.col }"
        >
          <div
            class="mt-2 h-12 bg-green-100 border-l-4 border-green-500 p-1 rounded-r-lg"
          >
            <p class="font-bold text-xs text-green-700">{{ dia.name }}</p>
            <p class="text-xs text-green-700">{{ dia.date.toLocaleDateString() }}</p>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '@/firebase/firebaseConfig'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const auth = getAuth()
const currentDate = ref(new Date())
const tareas = ref([])
const trips = ref([])

// OBTENER TAREAS DEL USUARIO
const loadTasks = async (userEmail) => {
  try {
    const q = query(
      collection(db, 'tareas'),
      where('responsable', '==', userEmail)
    )

    const querySnapshot = await getDocs(q)

    tareas.value = querySnapshot.docs
      .map(doc => {
        const data = doc.data()
        if (!data.fechaLimite?.toDate) return null
        return { ...data, fechaLimite: data.fechaLimite.toDate() }
      })
      .filter(Boolean)
    console.log("Tareas cargadas:", tareas.value)
  } catch (err) {
    console.error("Error cargando tareas:", err)
  }
}

// OBTENER TRIPS DEL USUARIO (como miembro o creador)
const loadTrips = async (userEmail) => {
  try {
    const q = query(
      collection(db, 'trips'),
      where('members', 'array-contains', userEmail)
    )

    const querySnapshot = await getDocs(q)
    trips.value = querySnapshot.docs
      .map(doc => {
        const data = doc.data()
        const start = new Date(data.startDate)
        const end = new Date(data.endDate)
        // Generar todos los días del viaje
        const days = []
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          days.push({ name: data.name, date: new Date(d) })
        }
        return days
      })
      .flat()
    console.log("Trips cargados:", trips.value)
  } catch (err) {
    console.error("Error cargando trips:", err)
  }
}

// Montaje: esperar usuario y cargar
onMounted(() => {
  onAuthStateChanged(auth, user => {
    if (user) {
      console.log("Usuario autenticado:", user.email)
      loadTasks(user.email)
      loadTrips(user.email)
    }
  })
})

// INICIO DE SEMANA
const getStartOfWeek = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - (day === 0 ? 6 : day - 1)
  return new Date(d.setDate(diff))
}
const startOfWeek = computed(() => getStartOfWeek(currentDate.value))

// CABECERA DE SEMANA
const weekDays = computed(() => {
  const days = []
  const start = startOfWeek.value
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push({
      date: d,
      label: d.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase(),
      day: d.getDate(),
      isToday: isToday(d)
    })
  }
  return days
})

const isToday = (d) => {
  const now = new Date()
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  )
}

const monthName = computed(() =>
  currentDate.value.toLocaleDateString('es-ES', { month: 'long' })
)
const currentYear = computed(() => currentDate.value.getFullYear())

// FILTRAR SOLO LAS TAREAS DE ESTA SEMANA
const weekTasks = computed(() => {
  return tareas.value
    .map(t => {
      const col = weekDays.value.findIndex(d =>
        d.date.getDate() === t.fechaLimite.getDate() &&
        d.date.getMonth() === t.fechaLimite.getMonth() &&
        d.date.getFullYear() === t.fechaLimite.getFullYear()
      ) + 1
      return { ...t, col }
    })
    .filter(t => t.col > 0)
})

// FILTRAR TRIPS QUE COINCIDAN CON LA SEMANA
const weekTripDays = computed(() => {
  return trips.value
    .map(t => {
      const col = weekDays.value.findIndex(d =>
        d.date.getDate() === t.date.getDate() &&
        d.date.getMonth() === t.date.getMonth() &&
        d.date.getFullYear() === t.date.getFullYear()
      ) + 1
      return { ...t, col }
    })
    .filter(t => t.col > 0)
})

// NAVEGACIÓN SEMANAL
const nextWeek = () => {
  currentDate.value = new Date(currentDate.value.setDate(currentDate.value.getDate() + 7))
}
const previousWeek = () => {
  currentDate.value = new Date(currentDate.value.setDate(currentDate.value.getDate() - 7))
}
</script>

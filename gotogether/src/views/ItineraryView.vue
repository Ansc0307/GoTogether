<!-- /views/ItineraryView.vue -->
<template>
  <div>
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-800">Itinerario del Viaje</h1>
      <button
        @click="showCreate = true"
        class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:brightness-110 shadow"
        title="Añadir evento"
      >
        <span class="text-lg">+</span>
        Añadir Evento
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
      <!-- Columna principal: Itinerario por días -->
      <section class="lg:col-span-2 space-y-8">
        <div v-if="groups.length === 0" class="text-gray-500">
          No hay actividades aún. Agrega tareas para construir el itinerario.
        </div>

        <div
          v-for="grp in groups"
          :key="grp.key"
          class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <!-- Encabezado de día -->
          <div class="flex items-center gap-4 px-5 py-4 border-b border-gray-200 bg-gray-50">
            <div class="text-center">
              <div class="text-xs uppercase text-gray-500">{{ grp.weekday }}</div>
              <div class="text-2xl font-bold text-gray-900">{{ grp.day }}</div>
              <div class="text-xs text-gray-500">{{ grp.monthYear }}</div>
            </div>
            <div class="h-10 w-px bg-gray-300 mx-2"></div>
            <h3 class="text-lg font-semibold text-gray-800">Día {{ grp.dayNumber }}</h3>
          </div>

          <!-- Actividades del día -->
          <ul class="divide-y divide-gray-100">
            <li
              v-for="t in grp.items"
              :key="t.id"
              class="flex items-start gap-4 px-5 py-4 hover:bg-gray-50"
            >
              <div class="w-20 shrink-0 text-right">
                <div class="text-sm font-medium text-gray-900">
                  {{ formatTime(t.fechaLimite) }}
                </div>
                <div class="text-xs text-gray-400">hora</div>
              </div>
              <div class="flex-1">
                <p class="font-medium text-gray-900">{{ t.nombre }}</p>
                <p class="text-sm text-gray-600" v-if="t.descripcion">{{ t.descripcion }}</p>
              </div>
              <span
                class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                :class="t.estado === 'completada' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
              >
                {{ t.estado || 'pendiente' }}
              </span>
            </li>
          </ul>
        </div>
      </section>

      <!-- Columna lateral: Próximos eventos -->
      <aside class="space-y-6">
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div class="px-5 py-4 border-b border-gray-200">
            <h4 class="font-semibold text-gray-800">Próximos Eventos</h4>
          </div>
          <ul class="divide-y divide-gray-100">
            <li
              v-for="t in proximos"
              :key="t.id"
              class="px-5 py-3 hover:bg-gray-50"
            >
              <div class="text-sm font-medium text-gray-900">{{ t.nombre }}</div>
              <div class="text-xs text-gray-500">{{ formatDateTime(t.fechaLimite) }}</div>
            </li>
            <li v-if="proximos.length === 0" class="px-5 py-4 text-gray-500">
              No hay eventos próximos.
            </li>
          </ul>
        </div>
      </aside>
    </div>

    <!-- Modal crear tarea -->
    <TaskForm
      :visible="showCreate"
      mode="create"
      :tripId="tripId"
      @close="showCreate = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { db } from '../firebase/firebaseConfig'
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore'
import TaskForm from '../components/tareas/TaskForm.vue'

const route = useRoute()
const tripId = ref(route.params.id)
const tasks = ref([])
const showCreate = ref(false)
const tripStartDate = ref(null) // Date a medianoche

onMounted(() => {
  if (!tripId.value) return
  const q = query(collection(db, 'tareas'), where('tripId', '==', tripId.value))
  onSnapshot(q, (snap) => {
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    // ordenar por fechaLimite ascendente (nulls al final)
    list.sort((a,b) => {
      const ta = a?.fechaLimite?.toMillis?.() ?? Number.MAX_SAFE_INTEGER
      const tb = b?.fechaLimite?.toMillis?.() ?? Number.MAX_SAFE_INTEGER
      return ta - tb
    })
    tasks.value = list
  })

  // cargar startDate del trip
  const tRef = doc(db, 'trips', tripId.value)
  getDoc(tRef).then(snap => {
    if (snap.exists()) {
      const s = snap.data()?.startDate // esperado: 'YYYY-MM-DD'
      if (typeof s === 'string' && s.length >= 10) {
        const [y,m,d] = s.split('-').map(Number)
        const dt = new Date(Date.UTC(y, (m-1), d))
        tripStartDate.value = dt
      }
    }
  })
})

const groups = computed(() => {
  // agrupar por AAAA-MM-DD de fechaLimite
  const map = new Map()
  for (const t of tasks.value) {
    const dt = t?.fechaLimite?.toDate?.()
    if (!dt) continue
    const key = dt.toISOString().slice(0,10)
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(t)
  }
  const entries = [...map.entries()].sort((a,b) => a[0].localeCompare(b[0]))
  return entries.map(([key, items]) => {
    const dt = items[0].fechaLimite.toDate()
    const day = dt.toLocaleDateString('es-ES', { day: '2-digit' })
    const monthYear = dt.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    const weekday = dt.toLocaleDateString('es-ES', { weekday: 'short' })
    // Calcular número de día relativo a startDate
    let dayNumber = 1
    if (tripStartDate.value) {
      const msPerDay = 24*60*60*1000
      // usar solo fecha (UTC) para evitar desfaces
      const dUTC = Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate())
      const s = tripStartDate.value
      const sUTC = Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate())
      dayNumber = Math.max(1, Math.floor((dUTC - sUTC)/msPerDay) + 1)
    }
    return {
      key,
      dayNumber,
      day,
      monthYear,
      weekday,
      items
    }
  })
})

const proximos = computed(() => tasks.value
  .filter(t => t.fechaLimite?.toDate)
  .slice(0, 6)
)

const formatTime = (ts) => {
  if (!ts?.toDate) return ''
  return ts.toDate().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

const formatDateTime = (ts) => {
  if (!ts?.toDate) return ''
  const d = ts.toDate()
  const fecha = d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  const hora = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  return `${fecha} · ${hora}`
}
</script>

<style scoped>
/* simple aesthetic tweaks align with current design */
</style>

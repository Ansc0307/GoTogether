import { ref } from 'vue'
import { db } from '@/firebase/firebaseConfig'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'

export function useCalendarData() {
  const tareas = ref([])
  const trips = ref([])
  const votes = ref([])

  // ===============================
  // CARGAR TRIPS
  // ===============================
  const loadTrips = async (userEmail) => {
    try {
      const q = query(
        collection(db, 'trips'),
        where('members', 'array-contains', userEmail)
      )
      const querySnapshot = await getDocs(q)
      const tripMap = {} // guardamos id => trip para relacionar después

      trips.value = querySnapshot.docs
        .map(doc => {
          const data = doc.data()
          const start = new Date(data.startDate)
          const end = new Date(data.endDate)

          tripMap[doc.id] = data.name // guardamos el destino

          const days = []
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            days.push({
              id: doc.id,
              name: data.name,
              date: new Date(d)
            })
          }
          return days
        })
        .flat()

      await loadVotes(Object.keys(tripMap), tripMap)
      await loadTasks(userEmail, tripMap) // también pasamos el mapa a tareas

    } catch (err) {
      console.error("Error cargando trips:", err)
    }
  }

  // ===============================
  // CARGAR TAREAS
  // ===============================
  const loadTasks = async (userEmail, tripMap = {}) => {
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

          return {
            id: doc.id,
            ...data,
            fechaLimite: data.fechaLimite.toDate(),
            tripName: tripMap[data.tripId] || null // agregamos destino
          }
        })
        .filter(Boolean)
    } catch (err) {
      console.error("Error cargando tareas:", err)
    }
  }

  // ===============================
  // CARGAR VOTACIONES
  // ===============================
  const loadVotes = async (tripIds, tripMap = {}) => {
    try {
      const uniqueTrips = [...new Set(tripIds)]
      const requests = uniqueTrips.map(tripId =>
        getDocs(collection(db, "trips", tripId, "votaciones")).then(snapshot =>
          snapshot.docs.map(doc => {
            const data = doc.data()
            if (!data.deadline?.toDate) return null
            return {
              id: doc.id,
              tripId,
              tripName: tripMap[tripId] || null, // agregamos destino
              ...data,
              deadline: data.deadline.toDate(),
            }
          }).filter(Boolean)
        )
      )

      const results = await Promise.all(requests)
      votes.value = results.flat()

    } catch (err) {
      console.error("Error cargando votaciones:", err)
    }
  }

  return {
    tareas,
    trips,
    votes,
    loadTasks,
    loadTrips,
    loadVotes
  }
}

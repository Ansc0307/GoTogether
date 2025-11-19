import { ref } from 'vue'
import { db } from '@/firebase/firebaseConfig'
import { collection, query, where, getDocs } from 'firebase/firestore'

export function useCalendarData() {
  const tareas = ref([])
  const trips = ref([])
  const votes = ref([])

  // CARGAR TAREAS
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
          return {
            id: doc.id,
            ...data,
            fechaLimite: data.fechaLimite.toDate()
          }
        })
        .filter(Boolean)
    } catch (err) {
      console.error("Error cargando tareas:", err)
    }
  }

  // CARGAR TRIPS
  const loadTrips = async (userEmail) => {
    try {
      const q = query(
        collection(db, 'trips'),
        where('members', 'array-contains', userEmail)
      )

      const querySnapshot = await getDocs(q)

      const tripIds = []

      trips.value = querySnapshot.docs
        .map(doc => {
          const data = doc.data()
          const start = new Date(data.startDate)
          const end = new Date(data.endDate)
          const days = []

          tripIds.push(doc.id)

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

      await loadVotes(tripIds)

    } catch (err) {
      console.error("Error cargando trips:", err)
    }
  }

  // CARGAR VOTACIONES
  const loadVotes = async (tripIds) => {
    try {
      const voteArray = []

      const uniqueTrips = [...new Set(tripIds)]

      for (const tripId of uniqueTrips) {

        const votacionesRef = collection(
          db,
          'trips',
          tripId,
          'votaciones'
        )

        const querySnapshot = await getDocs(votacionesRef)

        querySnapshot.forEach(doc => {
          const data = doc.data()
          if (!data.deadline?.toDate) return

          voteArray.push({
            id: doc.id,
            tripId,
            ...data,
            deadline: data.deadline.toDate(),
          })
        })
      }

      votes.value = voteArray

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

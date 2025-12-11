// src/composables/useDashboard.js
import { ref, computed, onMounted } from 'vue'
import { useAuth } from './useAuth'
import { useCalendarData } from './useCalendarData'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/firebaseConfig'

export function useDashboard() {
  const { user } = useAuth()
  const { tareas, trips, votes, loadTasks, loadTrips } = useCalendarData()
  
  const dashboardData = ref({
    totalTrips: 0,
    upcomingTrips: [],
    budgetStatus: [],
    recentActivity: []
  })
  
  const loading = ref(true)

  const stats = computed(() => ({
    trips: dashboardData.value.totalTrips,
    active: dashboardData.value.upcomingTrips.length,
    pendingTasks: tareas.value.length,
    votesPending: votes.value.filter(v => {
      if (!v || !v.deadline) return false
      const deadline = v.deadline?.toDate ? v.deadline.toDate() : new Date(v.deadline)
      return deadline > new Date()
    }).length
  }))

  const loadUserTrips = async () => {
    try {
      if (!user.value?.email) {
        console.log('No hay usuario autenticado')
        return
      }

      const q = query(
        collection(db, 'trips'),
        where('members', 'array-contains', user.value.email)
      )
      const querySnapshot = await getDocs(q)
      const userTrips = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      dashboardData.value.totalTrips = userTrips.length
      
      // Filtrar viajes próximos (próximos 30 días)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const nextMonth = new Date()
      nextMonth.setDate(nextMonth.getDate() + 30)
      
      dashboardData.value.upcomingTrips = userTrips
        .filter(trip => {
          if (!trip.startDate) return false
          const startDate = new Date(trip.startDate)
          return startDate >= today && startDate <= nextMonth
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 5)

      // Cargar estado de presupuestos para estos viajes
      await loadBudgetStatus(userTrips.slice(0, 3))

    } catch (error) {
      console.error('Error loading trips:', error)
    }
  }

  const loadBudgetStatus = async (trips) => {
    try {
      const budgetPromises = trips.map(async (trip) => {
        try {
          // Obtener presupuesto del viaje
          const budgetQuery = query(
            collection(db, 'budgets'),
            where('tripId', '==', trip.id)
          )
          const budgetSnapshot = await getDocs(budgetQuery)
          
          // Obtener gastos del viaje
          const expensesQuery = query(
            collection(db, 'expenses'),
            where('tripId', '==', trip.id)
          )
          const expensesSnapshot = await getDocs(expensesQuery)
          
          const total = budgetSnapshot.empty ? 0 : budgetSnapshot.docs[0]?.data()?.total || 0
          const spent = expensesSnapshot.docs.reduce((sum, doc) => sum + (doc.data().monto || 0), 0)
          
          return {
            id: trip.id,
            tripName: trip.name,
            total,
            spent,
            status: total === 0 ? 'healthy' : spent / total > 0.9 ? 'critical' : spent / total > 0.7 ? 'warning' : 'healthy'
          }
        } catch (err) {
          console.error(`Error loading budget for trip ${trip.id}:`, err)
          return null
        }
      })
      
      const budgets = await Promise.all(budgetPromises)
      dashboardData.value.budgetStatus = budgets.filter(Boolean)

    } catch (error) {
      console.error('Error loading budget status:', error)
    }
  }

  const loadRecentActivity = async () => {
    try {
      // Cargar alias para las tareas
      const tripAliasMap = {}
      
      // Obtener alias de cada viaje
      const tripPromises = tareas.value.map(async (task) => {
        if (!task.tripId || tripAliasMap[task.tripId]) return
        
        try {
          const tripRef = doc(db, 'trips', task.tripId)
          const tripSnap = await getDoc(tripRef)
          if (tripSnap.exists()) {
            tripAliasMap[task.tripId] = {
              name: tripSnap.data().name,
              alias: tripSnap.data().alias || {}
            }
          }
        } catch (error) {
          console.error(`Error loading trip ${task.tripId}:`, error)
        }
      })
      
      await Promise.allSettled(tripPromises)

      // Usamos datos de tareas y votaciones
      const recentTasks = tareas.value
        .map(task => {
          const tripInfo = tripAliasMap[task.tripId]
          const responsableAlias = tripInfo?.alias?.[task.responsable] || 
                                  task.responsable?.split('@')[0] || 
                                  'Responsable'
          
          return {
            id: task.id,
            type: 'task',
            title: task.nombre || 'Tarea sin título',  // Cambiado de 'title' a 'nombre'
            description: `Responsable: ${responsableAlias}`,
            date: task.fechaLimite,
            tripName: tripInfo?.name || task.tripName || 'Viaje',
            status: 'pendiente',
            tripId: task.tripId, // Agregar tripId para redirección
            fullTask: task // Guardar la tarea completa para uso posterior
          }
        })
        .slice(0, 5)

      const recentVotes = votes.value
        .filter(v => v && v.deadline)
        .map(vote => {
          const deadline = vote.deadline?.toDate ? vote.deadline.toDate() : new Date(vote.deadline)
          return { ...vote, deadline }
        })
        .filter(v => v.deadline > new Date())
        .map(vote => ({
          id: vote.id,
          type: 'vote',
          title: vote.title || 'Votación sin título',
          description: 'Votación activa',
          date: vote.deadline,
          tripName: vote.tripName,
          status: 'activo',
          tripId: vote.tripId,
          fullVote: vote
        }))
        .slice(0, 5)

      dashboardData.value.recentActivity = [...recentTasks, ...recentVotes]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 8)

    } catch (error) {
      console.error('Error loading recent activity:', error)
    }
  }

  const loadDashboard = async () => {
    loading.value = true
    try {
      // Verificar que haya usuario autenticado
      if (!user.value?.email) {
        console.log('No hay usuario para cargar dashboard')
        return
      }

      // Cargar datos del calendario primero
      await Promise.all([
        loadTrips(user.value.email),
        loadTasks(user.value.email)
      ])
      
      // Luego cargar datos específicos del dashboard
      await Promise.all([
        loadUserTrips(),
        loadRecentActivity()
      ])
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      loading.value = false
    }
  }

  // Llamar cuando el componente se monta
  const initDashboard = () => {
    if (user.value) {
      loadDashboard()
    }
  }

  return {
    dashboardData,
    stats,
    loading,
    loadDashboard,
    refresh: loadDashboard,
    initDashboard,
    tareas, // Exponer para que DashboardView pueda usarlas directamente
    votes   // Exponer para que DashboardView pueda usarlas directamente
  }
}
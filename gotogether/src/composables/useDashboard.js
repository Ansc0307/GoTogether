// src/composables/useDashboard.js
import { ref, computed, onMounted } from 'vue'
import { useAuth } from './useAuth'
import { useCalendarData } from './useCalendarData'
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase/firebaseConfig'

export function useDashboard() {
  const { user } = useAuth()
  const { tareas, trips, votes, loadTasks, loadTrips, loadVotes } = useCalendarData()
  
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
    votesPending: votes.value.filter(v => new Date(v.deadline) > new Date()).length
  }))

  const loadUserTrips = async () => {
    try {
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
      const nextMonth = new Date()
      nextMonth.setDate(nextMonth.getDate() + 30)
      
      dashboardData.value.upcomingTrips = userTrips
        .filter(trip => {
          const startDate = new Date(trip.startDate)
          return startDate >= today && startDate <= nextMonth
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 5)

      // Cargar estado de presupuestos para estos viajes
      await loadBudgetStatus(userTrips.slice(0, 5))

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
          
          const total = budgetSnapshot.empty ? 0 : budgetSnapshot.docs[0].data().total || 0
          const spent = expensesSnapshot.docs.reduce((sum, doc) => sum + (doc.data().monto || 0), 0)
          
          return {
            id: trip.id,
            tripName: trip.name,
            total,
            spent,
            status: spent / total > 0.9 ? 'critical' : spent / total > 0.7 ? 'warning' : 'healthy'
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
      // Usamos datos de tareas y votaciones del composable useCalendarData
      const recentTasks = tareas.value
        .map(task => ({
          id: task.id,
          type: 'task',
          title: task.title,
          description: `Tarea: ${task.description || 'Sin descripción'}`,
          date: task.fechaLimite,
          tripName: task.tripName,
          status: 'pendiente'
        }))
        .slice(0, 5)

      const recentVotes = votes.value
        .filter(v => new Date(v.deadline) > new Date())
        .map(vote => ({
          id: vote.id,
          type: 'vote',
          title: vote.title,
          description: 'Votación activa',
          date: vote.deadline,
          tripName: vote.tripName,
          status: 'activo'
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
      // Cargar datos del calendario primero
      await Promise.all([
        loadTrips(user.value.email),
        loadTasks(user.value.email),
        loadVotes([], {})
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

  onMounted(() => {
    if (user.value) {
      loadDashboard()
    }
  })

  // Escuchar cambios en el usuario
  const watchUser = computed(() => user.value)
  
  return {
    dashboardData,
    stats,
    loading,
    loadDashboard,
    refresh: loadDashboard,
    tareas, // Exponer para que DashboardView pueda usarlas directamente
    votes   // Exponer para que DashboardView pueda usarlas directamente
  }
}
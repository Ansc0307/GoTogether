import { createRouter, createWebHistory } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

// Componentes de testing/desarrollo
import TestFirebase from '../components/TestFirebase.vue'
import Presupuesto from '../views/PresupuestoView.vue'
import AddCost from '../components/budget/AddCost.vue'

// Componentes de votaciones (Josh - RF3/RF4)
import Home from '../views/Home.vue'
import VotingList from '../views/VotingList.vue'

// tareas 
import TasksView from '../views/TasksView.vue'

// viajes (RF5)
import TripsView from '../views/trips/TripsView.vue'
import TripDashboard from "../views/trips/TripDashboard.vue";

// mapas
import MapasView from '../views/MapasView.vue'
//importaciones de auth
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import ResetPasswordView from '../views/auth/ResetPasswordView.vue'

//welcome view
import WelcomeView from '../views/WelcomeView.vue'

const routes = [
  // Ruta por defecto - Home público
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  
  // Rutas de desarrollo/testing
  {
    path: '/test-firebase',
    name: 'TestFirebase',
    component: TestFirebase
  },
  {
    path: '/presupuesto',
    name: 'Presupuesto',
    component: Presupuesto
  },
  {
    path: '/presupuesto/agregar-gasto',
    name: 'AgregarGasto',
    component: AddCost
  },
  
  // Rutas de votaciones
  {
    path: '/voting',
    name: 'VotingList',
    component: VotingList,
    meta: {
      requiresAuth: true,
      section: 'voting'
    }
  },
  {
    path: '/voting/create',
    name: 'CreateVoting',
    component: () => import('../views/voting/CreateVoting.vue'),
    meta: { requiresAuth: true, section: 'voting' }
  },
  {
    path: '/voting/:id',
    name: 'VotingDetail',
    component: () => import('../views/voting/VotingDetail.vue'),
    meta: { requiresAuth: true, section: 'voting' },
  },

  //rutas para viajes
  { path: '/misviajes', name: 'Trips', component: TripsView, meta: { requiresAuth: true, section: 'trips' } },
  { path: "/trip/:id", name: "TripDashboard", component: TripDashboard , meta: { requiresAuth: true, section: 'trips' }},
  {
    path: "/trips/:id",
    name: "trip-dashboard",
    component: TripDashboard,
    props: true,
    children: [
      {
        path: "tareas",
        name: "trip-tareas",
        component: TasksView,
      },
      {
        path: "presupuesto",
        name: "trip-presupuesto",
        component: Presupuesto,
      },
      {
        path: "mapa",
        name: "trip-mapa",
        component: MapasView,
      },
      {
      path:"votaciones",
      name:"trip-votaciones",
      component: VotingList,
      }
      // futuros tabs:
      // { path: "itinerario", component: ItinerarioView },
      // { path: "presupuesto", component: PresupuestoView },
    ],
  },
  
  //rutas de autenticación
  { path: '/login', name: 'Login', component: LoginView, meta: { requiresGuest: true } },
  { path: '/register', name: 'Register', component: RegisterView, meta: { requiresGuest: true } },
  { path: '/reset-password', name: 'ResetPassword', component: ResetPasswordView, meta: { requiresGuest: true } },


  //ruta welcome
  { path: '/welcome', name: 'Welcome', component: WelcomeView  , meta: { requiresAuth: true }},
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard global: protege rutas con requiresAuth y evita que usuarios logueados visiten rutas de invitado
let authReady = false
let currentUser = null
const auth = getAuth()
onAuthStateChanged(auth, (u) => {
  currentUser = u
  authReady = true
})

router.beforeEach((to, from, next) => {
  const proceed = () => {
    if (to.meta?.requiresAuth && !currentUser) {
      return next({ name: 'Login', query: { redirect: to.fullPath } })
    }
    if (to.meta?.requiresGuest && currentUser) {
      // Redirigir a una sección interna; votaciones por defecto
      return next({ name: 'VotingList' })
    }
    next()
  }

  if (!authReady) {
    const unreg = onAuthStateChanged(auth, () => {
      unreg()
      authReady = true
      currentUser = auth.currentUser
      proceed()
    })
  } else {
    proceed()
  }
})

export default router
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

//importaciones de auth
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import ResetPasswordView from '../views/auth/ResetPasswordView.vue'

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
  {
    path: '/tareas',
    name: 'Tareas',
    component: TasksView,
    meta: {
      requiresAuth: true,
      section: 'tasks'
    }
  },
  //rutas de autenticación
  { path: '/login', name: 'Login', component: LoginView, meta: { requiresGuest: true } },
  { path: '/register', name: 'Register', component: RegisterView, meta: { requiresGuest: true } },
  { path: '/reset-password', name: 'ResetPassword', component: ResetPasswordView, meta: { requiresGuest: true } },
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
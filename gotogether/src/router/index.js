import { createRouter, createWebHistory } from 'vue-router'

// Componentes de testing/desarrollo
import TestFirebase from '../components/TestFirebase.vue'
import Presupuesto from '../views/PresupuestoView.vue'
import AddCost from '../components/budget/AddCost.vue'

// Componentes de votaciones (Josh - RF3/RF4)
import Home from '../views/Home.vue'
import VotingList from '../views/VotingList.vue'

// tareas 
import TasksView from '../views/TasksView.vue'

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
    path: '/tareas',
    name: 'Tareas',
    component: TasksView,
    meta: {
      requiresAuth: true,
      section: 'tasks'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard para rutas que requieren autenticación
router.beforeEach((to, from, next) => {
  // Por ahora permitir todas las rutas
  // Aquí irá la lógica de autenticación cuando esté lista
  next()
})

export default router
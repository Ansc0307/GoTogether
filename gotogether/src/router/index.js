import { createRouter, createWebHistory } from 'vue-router';

import TestFirebase from '../components/TestFirebase.vue';
import Presupuesto from '../components/Presupuesto.vue';

const routes = [
  { path: '/', redirect: '/test-firebase' },
  { path: '/test-firebase', component: TestFirebase },
  { path: '/presupuesto', component: Presupuesto },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
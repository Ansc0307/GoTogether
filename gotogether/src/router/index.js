import { createRouter, createWebHistory } from 'vue-router';
import TestFirebase from '../components/TestFirebase.vue';

const routes = [

 { path: '/', redirect: '/test-firebase' },
  { path: '/test-firebase', component: TestFirebase },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
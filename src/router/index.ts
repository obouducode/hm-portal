import { createRouter, createWebHistory } from 'vue-router'
import AboutView from '../views/about.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'registration',
      component: () => import('../views/registration.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView
    }
  ]
})

export default router

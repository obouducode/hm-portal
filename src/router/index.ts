import { createRouter, createWebHistory } from 'vue-router'
import AboutView from '../views/about/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'registration',
      component: () => import('../views/registration/index.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView
    }
  ]
})

export default router

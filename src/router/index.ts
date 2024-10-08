import { createRouter, createWebHistory, type Router } from 'vue-router'
import {
  routes,
  handleHotUpdate, 
} from 'vue-router/auto-routes'
import { useStoreAuth } from '@/stores/auth'

export const router: Router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, _from) => {
  const { authState } = useStoreAuth()

  /**
   * Check if the next route needs auth,
   * we verify the user is authenticated
   */
  if (to.meta.requireAuth) {
    console.info('[router] auth required : ', authState.isAuthenticated)
    if (!authState.isAuthenticated) {
      console.error('Forbidden!')
      // redirect on the login page ?
      // or go on a 403 ?
      return {
        path: '/403',
        query: {
          origin: to.path
        }
      }
    }
  }
})


// This will update routes at runtime without reloading the page
if (import.meta.hot) { 
  handleHotUpdate(router) 
} 

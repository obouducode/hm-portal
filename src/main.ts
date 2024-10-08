import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './plugins/vee-validate'
import * as Sentry from '@sentry/vue'

import { setupLckDesignSystem } from '@locokit/designsystem'
import ToastService from 'primevue/toastservice'

import App from './App.vue'
import { router } from './router'
import { useStoreAuth } from './stores/auth'

/**
 * Boot the VueJS application
 *
 * * reload the authentication data
 */
async function boot() {
  const app = createApp(App)

  Sentry.init({
    app,
    dsn: 'https://2fefe8f3342314784ba1f999288a30d4@sentry.makina-corpus.net/66',
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0 // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  })

  app.use(createPinia())

  /**
   * Re authent user before router guards
   */
  const { reAuthenticate } = useStoreAuth()
  await reAuthenticate()

  setupLckDesignSystem(app)
  app.use(router)
  app.use(ToastService)

  /**
   * Code needed for focus directive in PrimeVue
   */
  app.directive('focus', {
    mounted(el: HTMLElement) {
      el.focus()
    }
  })

  app.mount('#app')
}

boot()

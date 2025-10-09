import { ref } from 'vue'
import { defineStore } from 'pinia'
import { lckClient } from '@/sdk'

export const useStoreAuth = defineStore('auth', () => {

  const authState = ref({
    loading: false,
    error: null as null | Error,
    user: null as null | Object,
    isAuthenticated: false,
  })

  async function login(email: string, password: string) {
    authState.value.loading = true
    try {
      console.info('[auth store] authenticating user...')
      const result = await lckClient.authenticate({
        strategy: 'local',
        email,
        password,
      })
      authState.value.error = null
      authState.value.isAuthenticated = true
      authState.value.user = result.user
    } catch (error) {
      console.error(error)
      authState.value.error = error as Error
      authState.value.isAuthenticated = false
    }
    authState.value.loading = false
  }

  async function reAuthenticate() {
    authState.value.loading = true
    try {
      console.info('[auth store] Re authenticating user...')
      const result = await lckClient.reAuthenticate()
      authState.value.error = null
      authState.value.isAuthenticated = true
      authState.value.user = result.user
    } catch (e) {
      console.error(e)
      authState.value.error = e as Error
      authState.value.isAuthenticated = false
    }
    authState.value.loading = false
  }


  async function logout () {
    authState.value.isAuthenticated = false
    authState.value.user = null
    await lckClient.logout()
  }

  return { authState, login, reAuthenticate, logout }
})

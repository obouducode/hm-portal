<script setup lang="ts">
import { SignInForm } from '@locokit/designsystem'
import { useStoreAuth } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useStoreAuth()
const router = useRouter()

async function onSubmit(data: { email: string; password: string }) {
  await authStore.login(data.email, data.password)
  /**
   * TODO: display a toast to say "connected !"
   */
  if (authStore.authState.isAuthenticated)
    router.push({
      name: '/admin/'
    })
}
</script>

<template>
  <main class="bg-white border rounded-md max-w-[48rem] mx-auto mt-4 p-4">
    <h1 class="text-xl text-center font-medium mb-4">Connexion au back office Héric Musique</h1>
    <sign-in-form
      :loading="authStore.authState.loading"
      :error="authStore.authState.error"
      @submit="onSubmit"
    />
  </main>
</template>

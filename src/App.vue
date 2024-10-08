<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useStoreAuth } from '@/stores/auth'

import PrimeButton from 'primevue/button'
import { computed } from 'vue'

const { authState } = useStoreAuth()
const route = useRoute()

const mainStyle = computed(() => {
  let result = {
    height: 'auto',
    'min-height': 'auto'
  }
  if (route.meta.displayHeader && !route.meta.displayFooter) {
    result.height = 'calc(100vh - 4rem)'
  }
  if (!route.meta.displayHeader && !route.meta.displayFooter) {
    result.height = '100%'
  }
  return result
})
</script>

<template>
  <header
    class="bg-white p-1 lg:p-2 shadow-md sticky top-0 w-full h-16 z-10"
    v-if="route.meta.displayHeader"
  >
    <nav class="flex items-center justify-between lg:justify-between w-full lg:w-[64rem] mx-auto">
      <router-link to="/" class="flex justify-between items-center">
        <img
          alt="Héric Musique logo"
          src="/favicon-256x256.png"
          class="inline-block mr-2 lg:mr-4 h-8"
        />
        <h1 class="text-xl font-medium hidden md:block">Héric Musique</h1>
      </router-link>

      <prime-button rounded as="router-link" to="/registration" class="!px-4">
        <i class="bi bi-music-note-beamed" />
        S'inscrire !
        <i class="bi bi-music-note-beamed" />
      </prime-button>

      <prime-button
        as="router-link"
        rounded
        outlined
        to="/auth/login"
        icon="bi bi-person"
        label="Se connecter"
        v-if="!authState.isAuthenticated"
      />

      <prime-button
        as="router-link"
        rounded
        outlined
        to="/admin"
        icon="bi bi-person"
        label="Back office"
        v-else
      />
    </nav>
  </header>

  <main :style="mainStyle" class="grow">
    <router-view />
  </main>

  <footer
    class="bg-slate-300 w-full p-4 md:p-16 shadow-xl border-t border-solid border-slate-400"
    v-if="route.meta.displayFooter"
  >
    <div class="max-w-[64rem] mx-auto flex flex-col md:flex-row gap-4 justify-between text-center">
      <a href="mailto:heric.musique@gmail.com" target="_blank">
        <i class="bi bi-envelope text-lg mr-2" />
        heric.musique@gmail.com
      </a>

      <a href="tel:+33767055100" target="_blank" class="text-center">
        <i class="bi bi-telephone text-lg mr-2" />
        07 67 05 51 00
        <br />
        (Merci de laisser un message sur la boite vocale)
      </a>

      <a href="https://www.facebook.com/profile.php?id=100092536255661" target="_blank">
        <i class="bi bi-facebook text-lg mr-2" />
        Facebook
      </a>

      <router-link class="mx-4" to="/about">
        <i class="bi bi-info-circle text-lg mr-1" />
        À propos
      </router-link>
    </div>
  </footer>
</template>

<style>
:root {
  --hm-color: 36, 62, 58;
}
.text-shadow {
  text-shadow: 1px 1px 1px gray;
}
html,
body {
  font-size: 14px;
}
</style>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="bg-white p-2 lg:p-4 mb-8 shadow-md">

    <nav class=" flex items-center justify-center lg:justify-between w-full lg:w-[50rem] mx-auto">

      <img alt="Héric Musique logo" src="/logo-hm.jpg" class="inline-block mr-4 lg:mr-16 h-12"/>

      <router-link
        class="text-lg mx-4"
        to="/"
      >
      Inscription
      </router-link>
      <router-link
        class="text-lg mx-4"
        to="/about"
      >
      À propos
      </router-link>
    </nav>
  </header>

  <main class="mx-auto w-full max-w-[48rem] my-2 md:my-8 bg-white p-2 md:p-4 rounded-lg border">
    <router-view />
  </main>

</template>

<style>
  .router-link-active.router-link-exact-active {
    text-decoration: underline;
  }
</style>

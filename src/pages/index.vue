<script setup lang="ts">
import PrimeButton from 'primevue/button'

definePage({
  meta: {
    displayHeader: true,
    displayFooter: true
  }
})
</script>

<template>
  <div
    class="bg-cover h-full flex flex-col justify-around p-2 items-center"
    style="background-image: url('/assets/58ce813b7c054750b62cdbc5b8858ed4.webp')"
  >
    <h1 class="text-5xl md:text-6xl text-center font-bold text-white text-shadow">
      Bienvenue sur le site de l'école Héric Musique !
    </h1>
    <h2 class="text-3xl md:text-4xl text-center font-semibold text-white text-shadow">
      Apprendre, jouer, partager,
    </h2>
    <h2 class="text-3xl md:text-4xl text-center font-semibold text-white text-shadow">
      les trois valeurs que vous rencontrerez en nous rejoignant !
    </h2>

    <prime-button
      rounded
      as="router-link"
      to="/registration"
      class="!px-8 !py-4 !text-2xl font-semibold"
    >
      <i class="bi bi-music-note-beamed" />
      S'inscrire !
      <i class="bi bi-music-note-beamed" />
    </prime-button>
  </div>
</template>

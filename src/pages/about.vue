<template>
  <div class="mx-auto bg-white max-w-[64rem] p-4 mt-8 border rounded-md">
    <h1 class="text-2xl font-bold mb-4">À propos</h1>
    <p>Ce site est mis en place pour les inscriptions à l'école de musique d'Héric (44).</p>
    <p class="my-2">
      <em>Directeur de la publication : </em>
      <a href="https://hericmusique.fr" target="_blank"> Héric Musique </a>
    </p>
    <p class="my-2">
      <em>Hébergement : </em>
      <a href="https://www.netlify.com/" target="_blank">Netlify</a>
    </p>
    <p class="my-2">
      <em>Contact :</em>
      <a href="mailto:heric.musique@gmail.com"> heric.musique@gmail.com </a>
    </p>
    <p class="my-2">
      <em>Développeur :</em>
      <a href="https://github.com/mdartic/" target="_blank"> @mdartic </a>
    </p>
    <p class="my-2">
      <em>Code source :</em>
      <a href="https://github.com/obouducode/hm-portal" target="_blank">
        https://github.com/obouducode/hm-portal
      </a>
    </p>

    <p class="mt-8">
      L'association loi 1901 Héric Musique bénéficie de subventions de la part de la mairie d'Héric
      ainsi que du conseil départemental de Loire Atlantique.
    </p>
  </div>
</template>

<script setup lang="ts">
definePage({
  meta: {
    displayHeader: true,
    displayFooter: true
  }
})
</script>

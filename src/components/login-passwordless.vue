<script setup lang="ts">
import InputText from 'primevue/inputtext'
import PrimeButton from 'primevue/button'
import { ref, defineEmits } from 'vue'

const emit = defineEmits(['submit'])

const state = ref({
  email: ''
})

function onSubmit () {
  emit('submit', state.value.email)
}
</script>

<template>
  <form>
    <div class="flex flex-col gap-2 mb-4">
      <label for="email">Email adhérent</label>
      <InputText id="email" v-model="state.email" aria-describedby="email-help" />
      <small id="email-help">Entrez votre email pour obtenir un lien d'authentification sur votre boîte mail.</small>
    </div>

    <prime-button type="submit" @click="onSubmit" class="">
      Obtenir mon lien d'inscription
    </prime-button>
  </form>
</template>



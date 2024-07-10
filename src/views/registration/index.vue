<script setup lang="ts">
import { ref, computed } from 'vue'
import DataForm from '@/components/data-form.vue'
import MultiDataForm from '@/components/multi-data-form.vue'
import PrimeButton from 'primevue/button'
import { formRecord } from './form-record'
import { generatePDF } from '@/helpers/pdf'

const stateForm = ref({
  currentStepIndex: 0,
  maxStepIndex: 0,
  dataForm: {} as Record<string, string | number | any[]>,
  errors: [],
  submitting: false,
  success: false,
  inprogress: true
})

stateForm.value.dataForm = {
  'membership_lastname': '',
  'membership_firstname': '',
  'membership_address': '',
  'membership_zipcode': '',
  'membership_city': '',
  'membership_tel_1': '',
  'membership_email_1': '',
  'activity': [{}]
}

const currentStep = computed(() => formRecord.steps[stateForm.value.currentStepIndex])

async function sendFormRecord() {
  stateForm.value.submitting = true
  try {
    await fetch('https://next.locokit.io/api/workspace/hm_bo/workflow/inscription_2024_2025/run', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: stateForm.value.dataForm
      })
    })
    stateForm.value.success = true
  } catch (e) {
    stateForm.value.errors.push(e)
  }
  stateForm.value.submitting = false
}

/**
 * Store values for the current step,
 * and upgrade to the next step
 */
function manageNextStep(values: Record<string, any>) {
  console.log(values)
  if (values) {
    Object.keys(values).forEach(key => {
      stateForm.value.dataForm[key] = values[key]
    })
  }
  if (stateForm.value.maxStepIndex === stateForm.value.currentStepIndex)
    stateForm.value.maxStepIndex++
  stateForm.value.currentStepIndex++
}

/**
 * Go to the step "index" only if maxStepIndex is >= to "index"
 */
function goToStep(index: number) {
  if (index > stateForm.value.maxStepIndex) return
  stateForm.value.currentStepIndex = index
}

</script>

<template>

  <ol class="items-center w-full space-y-4 sm:flex sm:space-x-8 sm:space-y-0 rtl:space-x-reverse mb-4 lg:mb-8 pb-2 lg:pb-4 px-2 lg:px-4 border-b">
    <li
      class="flex items-center space-x-2.5 rtl:space-x-reverse px-2"
      :class="{
        'text-blue-600 dark:text-blue-500 border-r border-l': stateForm.currentStepIndex === index,
        'opacity-50 cursor-not-allowed': index > stateForm.maxStepIndex,
        'cursor-pointer': index <= stateForm.maxStepIndex
      }"
      v-for="(step, index) in formRecord.steps"
      @click="goToStep(index)"
      :key="index"
    >
      <span
        class="flex items-center justify-center w-8 h-8 border border-blue-600 rounded-full shrink-0 dark:border-blue-500"
        :class="{
          'text-white bg-blue-600 dark:text-blue-500 border-r border-l': stateForm.currentStepIndex === index
        }"
      >
          {{ index + 1 }}
      </span>
      <span>
        <h3 class="font-medium leading-tight">
          {{ step.label['fr-FR'] }}
        </h3>
      </span>
    </li>
  </ol>

  <h2 class="text-xl text-center mb-4">
    {{ currentStep.label['fr-FR'] }}
  </h2>

  <p v-if="currentStep.description" class="px-2 lg:px-4 mb-4">
    {{ currentStep.description?.['fr-FR'] }}
  </p>

  <div class="px-2 lg:px-4 w-full flex flex-col justify-center">

    <template v-if="stateForm.currentStepIndex === 0">

      <p class="text-lg text-center my-4">
        Bienvenue sur le site d'inscription d'Héric Musique !
      </p>
      <p class="mb-4">
        Vous allez procéder au renseignement
        du formulaire d'inscription pour l'école de musique d'Héric,
        pour la saison 2024-2025.
      </p>
      <h2 class="text-xl font-bold mb-4">
        Tarifs 2024-2025
      </h2>
      <p class="mb-4">
        Vous pouvez retrouver les
        tarifs des différentes activités
        en téléchargeant
        <a href="tarifs_2024_2025.pdf" target="_blank" class="underline">
          le fichier disponible ici.
        </a>
        <br>
        Nous avons augmenté de modérément les tarifs cette année
        afin d'absorber une partie des évolutions à la hausse
        des charges de l'école de musique.
      </p>

      <p class="mb-4">
        À titre indicatif,
        voici le <strong>planning de la saison 2023-2024</strong> :
      </p>

      <ul>
        <li>
          <b>Chorale</b> : mercredi soir
        </li>
        <li>
          <b>Batterie</b> : mercredi
        </li>
        <li>
          <b>Guitare acoustique </b> : jeudi soir
        </li>
        <li>
          <b>Guitare électrique </b> : samedi après-midi
        </li>
        <li>
          <b>Accordéon</b> : mercredi après-midi
        </li>
        <li>
          <b>Formation musicale</b> : lundi soir et mardi soir
        </li>
        <li>
          <b>Piano</b> : lundi soir, mardi soir, mercredi et samedi matin
        </li>
        <li>
          <b>Éveil musical</b> : mercredi
        </li>
        <li>
          <b>Atelier batucada adulte</b> : mercredi
        </li>
        <li>
          <b>Flûte, saxophone, clarinette</b> : mercredi après-midi
        </li>
      </ul>

      Les activités adultes sont planifiées directement avec les professeurs.
      <prime-button
        type="submit"
        class="border p-2 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 font-bold w-64 mx-auto my-8 block"
        @click="$event => manageNextStep()"
      >
        Commencer l'inscription
      </prime-button>

    </template>

    <template v-else-if="stateForm.currentStepIndex === 1">
      <data-form
        :step="currentStep"
        :initial-data="stateForm.dataForm"
        @submit="manageNextStep"
      />
    </template>
    <template v-else-if="stateForm.currentStepIndex === 2">
      <multi-data-form
        :step="currentStep"
        :initial-values="{ data: stateForm.dataForm.activity }"
        @submit="manageNextStep"
      />
    </template>

    <template v-else-if="stateForm.currentStepIndex === 3">
      <data-form
        :step="currentStep"
        :initial-data="stateForm.dataForm"
        @submit="manageNextStep"
      />
    </template>
    <template v-else>
      <p>
        Avant de nous envoyer votre inscription,
        merci de vérifier l'ensemble des données renseignées.
      </p>

      {{ stateForm.dataForm }}

      Adhésion

      Activités souscrites

      <br/>

      <prime-button
        type="submit"
        class="border p-2 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 font-bold w-64 mx-auto my-8 block"
        @click="generatePDF(stateForm.dataForm)"
      >
        Générer PDF
      </prime-button>

      <h4 class="text-lg font-bold mb-2">Validation de votre inscription</h4>

      <p>
        Si vous pensez avoir finalisé votre inscription,
        vous pouvez procéder à sa validation.
      </p>
      <p>
        Cela va générer un email contenant
        votre demande d'inscription
        avec l'ensemble des renseignements précédents.
        Vous serez en copie du mail.
      </p>
      <p class="text-center text-lg font-bold my-4">ATTENTION !!!</p>
      <p>
        <strong>
          Votre inscription sera considérée comme définitive
          à la réception de votre paiement.
          Vous pouvez nous l'apporter lors de nos permanences.

          Lors du forum des associations, le 7 septembre 2024.
        </strong>
        <br>
        N'oubliez pas également de nous fournir votre attestation
        CAF concernant le quotient familial si vous êtes tranche 1 à 3.
      </p>
      <prime-button
        type="submit"
        class="border p-2 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 font-bold w-64 mx-auto my-8 block"
        @click="sendFormRecord"
        :disabled="stateForm.submitting"
        v-if="!stateForm.success"
      >
        Valider mon inscription
      </prime-button>

      <div
        v-else
        class="border p-2 rounded-lg font-bold w-64 mx-auto text-center shadow-md"
      >
        Inscription finalisée !!!
      </div>

    </template>

  </div>


</template>

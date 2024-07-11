<script setup lang="ts">
import { ref, computed } from 'vue'
import DataForm from '@/components/data-form.vue'
import MultiDataForm from '@/components/multi-data-form.vue'
import PrimeButton from 'primevue/button'
import { formRecord } from './form-record'
import { type FormRecordStep } from '@/declarations'

const stateForm = ref({
  currentStepIndex: 0,
  maxStepIndex: 0,
  dataForm: {} as Record<string, string | number | any[]>,
  errors: [] as any[],
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

const currentStep = computed<FormRecordStep>(() => formRecord.steps[stateForm.value.currentStepIndex])

async function sendFormRecord(values: Record<string, any>) {
  if (values) {
    Object.keys(values).forEach(key => {
      stateForm.value.dataForm[key] = values[key]
    })
  }

  stateForm.value.submitting = true
  try {
    const response = await fetch('https://next.locokit.io/api/workspace/hm_bo/workflow/inscription_2024_2025/run', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: stateForm.value.dataForm
      })
    })
    const json = await response.json()
    if (json.status === 'OK')
      stateForm.value.success = true
    else {
      stateForm.value.success = false
      stateForm.value.errors.push('Une erreur est survenue lors de la finalisation de votre inscription... Merci de prendre contact avec l\'équipe d\'Héric Musique sur le mail hericmusique@gmail.com')
    }


  } catch (e) {
    stateForm.value.errors.push(e)
  }
  stateForm.value.submitting = false
}

/**
 * Store values for the current step,
 * and upgrade to the next step
 */
function manageNextStep(values?: Record<string, any>) {
  if (values) {
    Object.keys(values).forEach(key => {
      stateForm.value.dataForm[key] = values[key]
    })
  }
  if (stateForm.value.maxStepIndex === stateForm.value.currentStepIndex)
    stateForm.value.maxStepIndex++
  stateForm.value.currentStepIndex++
  window.scrollTo(0,0)
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

  <ol class="items-center w-full space-y-4 sm:flex sm:space-x-8 sm:space-y-0 rtl:space-x-reverse mb-4 lg:mb-8 pb-2 lg:pb-4 border-b">
    <li
      class="flex items-center space-x-2.5 rtl:space-x-reverse px-2"
      :class="{
        'text-blue-600 dark:text-blue-500': stateForm.currentStepIndex === index,
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
        outlined
        class="p-2 rounded-lg w-64 mx-auto my-8"
        @click="() => manageNextStep()"
      >
        Commencer l'inscription
      </prime-button>

    </template>

    <template v-else-if="stateForm.currentStepIndex < formRecord.steps.length - 1">
      <multi-data-form
        v-if="currentStep.array"
        :step="currentStep"
        :initial-values="{ data: stateForm.dataForm[currentStep.property!] }"
        @submit="manageNextStep"
      />
      <data-form
        v-else
        :step="currentStep"
        :initial-data="stateForm.dataForm"
        @submit="manageNextStep"
      />
    </template>

    <template v-else>
      <div v-if="!stateForm.success">
        <h4 class="text-lg font-medium mb-2">
          Récapitulatif de votre inscription
        </h4>

        <p>
          Avant de nous envoyer votre inscription,
          merci de vérifier l'ensemble des données renseignées.
        </p>

        <data-detail :data="stateForm.dataForm" />

        <p class="mb-2">
          Si vous pensez avoir finalisé votre inscription,
          merci de nous indiquer la conduite à tenir
          concernant le droit à l'image,
          <a href="/2024-hm-reglement-interieur.pdf" target="_blank" class="underline">
            lisez le règlement intérieur disponible ici
          </a>
          puis cochez la case vous engageant à le respecter.
        </p>
        <p>
          Un email contenant
          votre demande d'inscription
          avec l'ensemble des renseignements précédents
          sera envoyé à Héric Musique,
          copie à l'adresse mail que vous aurez renseigné
          dans la page de coordonnées.
        </p>
        <p class="text-center text-lg font-bold my-4">ATTENTION !!! MERCI DE LIRE ATTENTIVEMENT !!!</p>
        <p class="mb-2">
          Votre inscription sera considérée comme
          <span  class="font-medium">définitive</span>
          à la réception de votre paiement.
          Vous pouvez nous l'apporter lors
          du forum des associations, le 7 septembre 2024.
        </p>
        <p>
          N'oubliez pas également de nous fournir <span class="font-medium">votre attestation
          CAF</span> concernant le quotient familial si vous êtes tranche 1 à 3.
        </p>

        <data-form
          class="mt-4"
          :step="currentStep"
          :initial-data="stateForm.dataForm"
          submit-button-label="Valider mon inscription"
          :submit-button-disabled="stateForm.submitting"
          @submit="sendFormRecord"
        />
      </div>

      <div
        v-else
        class="border p-8 rounded-md font-medium w-auto mx-auto text-center shadow-md"
      >
        Bravo !!!
        Votre inscription est finalisée !!!
      </div>

    </template>

  </div>

</template>

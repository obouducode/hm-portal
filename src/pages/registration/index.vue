<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import PrimeButton from 'primevue/button'
import { formRecord } from './form-record'
import GenericForm from '@/components/generic-form-array.vue'
import { type FormRecordStep, type FormValues } from '@/declarations'

definePage({
  meta: {
    displayHeader: true,
    displayFooter: true
  }
})
const stateForm = ref({
  currentStepIndex: 0,
  maxStepIndex: 0,
  dataForm: {} as Record<string, string | number | any[]>,
  errors: [] as any[],
  submitting: false,
  success: false,
  inprogress: true
})

const defaultDataForm = {
  membership_lastname: '',
  membership_firstname: '',
  membership_address: '',
  membership_zipcode: '',
  membership_city: '',
  membership_tel_1: '',
  membership_email_1: '',
  activity: [{}]
}
stateForm.value.dataForm = JSON.parse(
  localStorage.getItem('hm-data-form') || JSON.stringify(defaultDataForm)
)

watch(
  () => stateForm.value.dataForm,
  (newValue) => {
    localStorage.setItem('hm-data-form', JSON.stringify(newValue))
  },
  {
    deep: true
  }
)

const currentStep = computed<FormRecordStep>(
  () => formRecord.steps[stateForm.value.currentStepIndex]
)

async function sendFormRecord(values: Record<string, any>) {
  if (values) {
    Object.keys(values).forEach((key) => {
      stateForm.value.dataForm[key] = values[key]
    })
  }

  stateForm.value.submitting = true
  try {
    const response = await fetch(
      'https://next.locokit.io/api/workspace/hm_bo/workflow/inscription_2025_2026/run',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: stateForm.value.dataForm
        })
      }
    )
    const json = await response.json()
    if (json.status === 'OK') {
      stateForm.value.success = true
      localStorage.setItem('hm-data-form', JSON.stringify(defaultDataForm))
      stateForm.value.dataForm = JSON.parse(localStorage.getItem('hm-data-form'))
    } else {
      stateForm.value.success = false
      stateForm.value.errors.push(
        "Une erreur est survenue lors de la finalisation de votre inscription... Merci de prendre contact avec l'équipe d'Héric Musique sur le mail hericmusique@gmail.com"
      )
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
  console.log('manageNextStep', values)
  if (values) {
    Object.keys(values).forEach((key) => {
      stateForm.value.dataForm[key] = values[key]
    })
  }
  if (stateForm.value.maxStepIndex === stateForm.value.currentStepIndex)
    stateForm.value.maxStepIndex++
  stateForm.value.currentStepIndex++
  window.scrollTo(0, 0)
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
  <div
    class="mx-auto w-full max-w-[64rem] bg-white text-slate-900 dark:bg-slate-900 dark:text-white my-8 border p-4 md:p-8 rounded-md flex flex-col relative"
  >
    <ol
      class="items-center lg:justify-center flex space-x-8 space-y-0 py-2 mb-4 lg:mb-8 pb-2 lg:pb-4 border-b overflow-auto sticky top-0 bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
    >
      <li
        class="flex items-center space-x-2.5 px-2"
        :class="{
          'text-primary-600 dark:text-white': stateForm.currentStepIndex === index,
          'opacity-50 cursor-not-allowed': index > stateForm.maxStepIndex,
          'cursor-pointer': index <= stateForm.maxStepIndex
        }"
        v-for="(step, index) in formRecord.steps"
        @click="goToStep(index)"
        :key="index"
      >
        <span
          class="flex items-center justify-center w-8 h-8 border border-primary-400 rounded-full shrink-0 dark:border-primary-500"
          :class="{
            'text-white bg-primary-400 dark:text-white border-r border-l':
              stateForm.currentStepIndex === index
          }"
        >
          {{ index + 1 }}
        </span>
        <span>
          <h3 class="font-medium leading-tight">
            {{ step.label }}
          </h3>
        </span>
      </li>
    </ol>

    <h2 class="text-2xl text-center mb-4">
      {{ currentStep.label }}
    </h2>

    <template v-if="currentStep.description">
      <p class="px-2 lg:px-4 mb-4" v-for="(line, index) in currentStep.description" :key="index">
        {{ line }}
      </p>
    </template>

    <div class="px-2 lg:px-4 w-full flex flex-col justify-center overflow-hidden">
      <template v-if="stateForm.currentStepIndex === 0">
        <h3 class="text-xl text-center my-4">
          Bienvenue sur le formulaire d'inscription d'Héric Musique !
        </h3>
        <img src="/assets/heric_musique_800.png" class="w-48 mx-auto mb-4" />
        <p class="mb-4">
          Vous allez procéder au renseignement du formulaire d'inscription pour l'école de musique
          d'Héric, pour la saison 2025-2026.
        </p>
        <h2 class="text-xl font-bold mb-4">Tarifs 2025-2026</h2>
        <p class="mb-4">
          Vous pouvez retrouver les tarifs des différentes activités en téléchargeant
          <a
            href="https://www.hericmusique.fr/wp-content/uploads/2025/06/HM_Tarifs_2025-2026-1.pdf"
            target="_blank"
            class="underline"
          >
            le fichier disponible ici.
          </a>
        </p>

        <p class="mb-2">
          <strong>À noter</strong>, pour la rentrée 2025-2026, dans l'objectif d'aider les familles,
          nous procédons à une <strong>réduction de 10% à partir de la 2ème activité</strong>.
          <br />
          Ces 10% s'appliquent pour l'activité la ou les moins onéreuse•s.
          <br />
          Prenons l'exemple d'une famille en tranche 4 avec :
        </p>

        <ul class="ml-4 list-disc mb-2">
          <li>une activité cycle 1, piano</li>
          <li>une activité cycle 2, accordéon</li>
          <li>une activité chorale enfant</li>
        </ul>

        <p>Cela donnera la facturation suivante :</p>

        <div class="w-100 max-w-100 overflow-auto">
          <table class="mx-auto my-2 text-right">
            <thead>
              <tr>
                <th class="text-left">Libellé</th>
                <th class="px-2">Prix unitaire</th>
                <th class="px-2">Quantité</th>
                <th class="px-2">Réduction</th>
                <th class="px-2">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="px-2 text-left">Activité cycle 1, piano</td>
                <td class="px-2">575 €</td>
                <td class="px-2">1</td>
                <td class="px-2">10%</td>
                <td class="px-2">517,5 €</td>
              </tr>
              <tr>
                <td class="px-2 text-left">Activité cycle 1, accordéon</td>
                <td class="px-2">635 €</td>
                <td class="px-2">1</td>
                <td class="px-2"></td>
                <td class="px-2">635 €</td>
              </tr>
              <tr>
                <td class="px-2 text-left">Chorale enfant</td>
                <td class="px-2">150 €</td>
                <td class="px-2">1</td>
                <td class="px-2">10%</td>
                <td class="px-2">135 €</td>
              </tr>
              <tr>
                <td class="px-2 text-left">Adhésion à l'asso</td>
                <td class="px-2">25 €</td>
                <td class="px-2">1</td>
                <td class="px-2"></td>
                <td class="px-2">25 €</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th></th>
                <th></th>
                <th></th>
                <th class="px-2">Total</th>
                <th class="px-2">1287,5 €</th>
              </tr>
            </tfoot>
          </table>
        </div>
        <p class="mb-4">
          À titre indicatif, voici le <strong>planning estimé de la saison 2025-2026</strong> :
        </p>

        <ul class="ml-4 list-disc mb-2">
          <li><b>Chorale adultes</b> : mercredi soir</li>
          <li><b>Chorale enfants</b> : jeudi soir</li>
          <li><b>Chant individuel, technique vocale</b> : jeudi soir</li>
          <li><b>Batterie</b> : mercredi</li>
          <li><b>Guitare acoustique </b> : mercredi</li>
          <li><b>Guitare électrique </b> : mercredi</li>
          <li><b>Accordéon</b> : lundi soir, mardi soir, mercredi matin, jeudi soirée</li>
          <li><b>Formation musicale</b> : lundi soir et mardi soir</li>
          <li><b>Piano</b> : mardi soir et mercredi</li>
          <li><b>Éveil musical</b> : mercredi après-midi</li>
          <li><b>Atelier batucada adulte</b> : mercredi</li>
          <li><b>Flûte, saxophone, clarinette</b> : mercredi après-midi</li>
        </ul>

        Les activités adultes sont planifiées directement avec les professeurs.
        <prime-button
          rounded
          type="submit"
          class="p-2 rounded-lg w-64 mx-auto my-8"
          @click="() => manageNextStep()"
          label="Commencer l'inscription"
        />
      </template>

      <template v-else-if="stateForm.currentStepIndex < formRecord.steps.length - 1">
        <generic-form
          :fields="currentStep.fields!"
          :initial-values="
            currentStep.array
              ? (stateForm.dataForm[currentStep.property!] as FormValues[])
              : stateForm.dataForm
          "
          :labels="{
            submit: `Passer à l'étape suivante`,
            addRecord: 'Ajouter une activité',
            removeRecord: `Supprimer l'activité`
          }"
          :buttons="{
            submit: true,
            cancel: false,
            reset: false
          }"
          :array="currentStep.array"
          :property="currentStep.property"
          :record-title="currentStep.recordTitle"
          button-position="block"
          @submit="manageNextStep"
        />
      </template>

      <template v-else>
        <div v-if="!stateForm.success">
          <h4 class="text-lg font-medium mb-2">Récapitulatif de votre inscription</h4>

          <p>
            Avant de nous envoyer votre inscription, merci de vérifier l'ensemble des données
            renseignées. (Vous pouvez parcourir le formulaire à travers les étapes cliquables dans
            le bandeau supérieur)
          </p>

          <div class="rounded-xl p-4 border my-8">
            <div class="mb-4">
              <h3 class="text-xl mb-2">Fiche d'adhésion</h3>

              <template v-for="field in formRecord.steps[1].fields" :key="field.id">
                <div v-if="stateForm.dataForm[field.id]">
                  <label class="font-medium">{{ field.label }}</label>
                  {{ stateForm.dataForm[field.id] }}
                </div>
              </template>
            </div>
            <div class="mb-4">
              <h3 class="text-xl mb-2">
                Activité{{
                  (stateForm.dataForm[formRecord.steps[2].property as string] as any[]).length > 1
                    ? 's'
                    : ''
                }}
              </h3>

              <div class="flex flex-wrap gap-4">
                <div
                  class="w-100 lg:w-1/3 border rounded-xl p-4"
                  v-for="(activity, idx) in stateForm.dataForm[
                    formRecord.steps[2].property as string
                  ]"
                  :key="'activity' + idx"
                >
                  <template v-for="field in formRecord.steps[2].fields" :key="field.id">
                    <div v-if="activity[field.id]">
                      <label class="font-medium">{{ field.label }}</label>
                      {{ activity[field.id] }}
                    </div>
                  </template>
                </div>
              </div>
            </div>
            <div class="mb-4">
              <h3 class="text-xl mb-2">Paiement</h3>

              <template v-for="field in formRecord.steps[3].fields" :key="field.id">
                <div v-if="stateForm.dataForm[field.id]">
                  <label class="font-medium">{{ field.label }}</label>
                  {{ stateForm.dataForm[field.id] }}
                </div>
              </template>
            </div>
          </div>

          <p class="mb-2">
            Si vous pensez avoir finalisé votre inscription, merci de nous indiquer la conduite à
            tenir concernant le droit à l'image,
            <a
              href="https://www.hericmusique.fr/wp-content/uploads/2025/05/Reglement-interieur-2025.pdf"
              target="_blank"
              class="underline"
            >
              lisez le règlement intérieur disponible ici
            </a>
            puis cochez la case vous engageant à le respecter.
          </p>
          <p>
            Quand vous allez procéder à la validation de votre inscription, vous serez enregistré
            dans nos élèves. (pour l'instant, vous ne recevrez pas d'email récapitulatif) Nous
            reprendrons contact avec vous pour vous confirmer que votre inscription a bien été
            reçue, et s'il manque des éléments à votre inscription.
          </p>
          <p>N'hésitez pas à prendre contact avec nous si besoin par mail ou téléphone.</p>
          <p class="text-center text-lg font-bold my-4">
            ATTENTION !!! MERCI DE LIRE ATTENTIVEMENT !!!
          </p>
          <p class="mb-2 font-medium">
            Votre inscription sera considérée comme définitive à la réception de votre paiement.
          </p>
          <p>Vous pouvez</p>
          <ul class="ml-4 list-disc mb-2">
            <li>nous l'apporter lors du forum des associations le 6 septembre 2025</li>
            <li>nous le transmettre en main propre</li>
            <li>
              nous le déposer dans une enveloppe en mairie en précisant que c'est pour Héric Musique
            </li>
          </ul>
          <p>
            N'oubliez pas également de nous fournir
            <span class="font-medium">votre attestation CAF</span> concernant le quotient familial
            si vous êtes tranche 1 à 3.
          </p>

          <generic-form
            :fields="currentStep.fields!"
            :initial-values="stateForm.dataForm"
            :labels="{
              submit: 'Valider mon inscription'
            }"
            :loading="stateForm.submitting"
            :buttons="{
              submit: true,
              cancel: false,
              reset: false
            }"
            class="mt-4"
            button-position="block"
            @submit="sendFormRecord"
          />

          <div
            class="text-error text-danger text-red-500 my-8"
            v-for="(e, idx) in stateForm.errors"
            :key="'e_' + idx"
          >
            {{ e }}
          </div>
        </div>

        <div v-else class="border p-8 rounded-md font-medium w-auto mx-auto text-center shadow-md">
          <p class="mb-4">Bravo !!! Votre inscription est finalisée !!!</p>

          <p>
            Merci de nous faire parvenir votre paiement au plus tôt, et de nous en informer par mail
            (de préférence) ou téléphone.
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

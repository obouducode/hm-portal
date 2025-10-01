<script setup lang="ts">
import { definePage } from 'unplugin-vue-router/runtime'
import { onMounted, ref, watch } from 'vue'
import { lckWorkspaceHM } from '@/sdk/lckWorkspaceHM'

import PrimeTag from 'primevue/tag'
import PrimeButton from 'primevue/button'
import PrimePaginator, { type PageState } from 'primevue/paginator'
import PrimeInputText from 'primevue/inputtext'
import { type Paginated } from '@feathersjs/feathers'

definePage({
  meta: {
    requireAuth: true
  }
})

const loading = ref(false)
const registrations = ref<Paginated<MsRegistration>>({
  total: 0,
  limit: 20,
  skip: 0,
  data: []
})
const glossaries = ref<{
  seasons: MsSeason[]
  activity_instruments: MsActivityInstrument[]
  activity_courses: MsActivityCourse[]
}>({
  seasons: [],
  activity_instruments: [],
  activity_courses: []
})
const filters = ref<{
  search?: string
  season?: string
  instrument?: string
  cours?: string
}>({
  season: 'fbe54af7-8627-4d56-bb49-e76e5626e812' // saison 2025 2026
})

const pagination = ref({
  limit: 20,
  skip: 0
})

const currentRegistration = ref<MsRegistration>()

async function loadGlossaries() {
  loading.value = true
  try {
    const seasons = await lckWorkspaceHM.glossaries.season.record.find()
    glossaries.value.seasons = seasons.data
    const activity_instrument = await lckWorkspaceHM.glossaries.activity_instrument.record.find()
    glossaries.value.activity_instruments = activity_instrument.data
    const activity_course = await lckWorkspaceHM.glossaries.activity_course.record.find({
      query: {
        $limit: 100
      }
    })
    glossaries.value.activity_courses = activity_course.data
  } catch (e) {
    console.error(e)
  }
  loading.value = false
}

async function findRegistrations() {
  loading.value = true
  try {
    const queryFilters: Record<string, unknown> = {}
    if (filters.value.search)
      queryFilters['membership_person.lastname'] = {
        $ilike: '%' + filters.value.search + '%'
      }
    if (filters.value.season) {
      queryFilters['activity_course.season_id'] = filters.value.season
    }
    if (filters.value.instrument) {
      queryFilters['activity_instrument_id'] = filters.value.instrument
    }
    if (filters.value.cours) {
      queryFilters['activity_course_id'] = filters.value.cours
    }
    registrations.value = await lckWorkspaceHM.tables.registration.record.find({
      query: {
        $fetch: '[membership_person.[membership],activity_course,activity_instrument]',
        $limit: pagination.value.limit,
        $skip: pagination.value.skip,
        // need to be implement in LocoKit engine first
        // see https://github.com/locokit/locokit/issues/378
        // $sort: {
        //   'activity_course.slug': 1,
        //   lastname: 1
        // },
        ...queryFilters
      }
    })
  } catch (e) {
    console.error(e)
  }
  loading.value = false
}

/**
 * On mounted, try to load memberships,
 * according router query params
 */
onMounted(async () => {
  await loadGlossaries()
  findRegistrations()
})
async function onPage(event: PageState) {
  pagination.value.skip = event.first
  findRegistrations()
}

watch(() => filters, findRegistrations, { deep: true })
</script>

<template>
  <header class="bg-white border-b p-2 md:p-4">
    <h1 class="text-3xl leading-8 text-color font-medium">Fiches d'inscriptions</h1>
  </header>

  <div class="flex gap-4 p-4 flex-1 w-full overflow-hidden">
    <aside
      class="w-[28rem] shrink-0 bg-white border border-surface rounded-lg p-2 overflow-hidden flex flex-col"
    >
      <!-- affichage des inscriptions avec moteur de recherche et tri ? -->
      <div class="flex flex-col gap-1">
        <label for="search" class="text-color text-sm"> Recherche libre </label>
        <prime-input-text
          v-model="filters.search"
          id="search"
          type="text"
          size="small"
          icon="pi pi-search"
          placeholder="Rechercher..."
        />
      </div>

      <div class="flex flex-col gap-1">
        <label for="search" class="text-color text-sm"> Saison </label>
        <select v-model="filters.season" class="rounded border p-1 bg-white">
          <option selected :value="null">Sélectionner une saison</option>
          <option v-for="season in glossaries.seasons" :key="season.slug" :value="season.id">
            {{ season.name }}
          </option>
        </select>
      </div>
      <div class="flex gap-2">
        <div class="w-1/2 flex flex-col gap-1">
          <label for="search" class="text-color text-sm"> Cours </label>
          <select v-model="filters.cours" class="rounded border p-1 bg-white">
            <option selected :value="null">Sélectionner un cours</option>
            <option
              v-for="activity_course in glossaries.activity_courses"
              :key="activity_course.slug"
              :value="activity_course.id"
            >
              {{ activity_course.name }}
            </option>
          </select>
        </div>
        <div class="w-1/2 flex flex-col gap-1">
          <label for="search" class="text-color text-sm"> Instrument </label>
          <select v-model="filters.instrument" class="rounded border p-1 bg-white">
            <option selected :value="null">Sélectionner un instrument</option>
            <option
              v-for="activity_instrument in glossaries.activity_instruments"
              :key="activity_instrument.slug"
              :value="activity_instrument.id"
            >
              {{ activity_instrument.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="mt-1 leading-6 text-muted-color">{{ registrations.total }} élèves</div>

      <prime-paginator
        :rows="registrations.limit"
        :total-records="registrations.total"
        @page="onPage"
      />

      <div class="grow overflow-auto">
        <div
          class="flex gap-1 border p-2 hover:shadow-inner cursor-pointer"
          :class="{
            'bg-slate-100': currentRegistration === r
          }"
          v-for="r in registrations?.data"
          :key="'r_' + r.membership_person_id + '_' + r.activity_course_id"
          @click="currentRegistration = r"
        >
          <div class="flex flex-col gap-1 items-left grow">
            <div class="text-base font-medium">
              {{ r.membership_person!.lastname }} {{ r.membership_person!.firstname }}
            </div>
            <div class="text-base text-muted-color">
              {{ r.activity_course?.name }}
            </div>
          </div>
          <div class="flex flex-col gap-1 items-right text-right">
            <prime-tag
              :value="r.cancelled ? 'ANNULÉ' : 'CONFIRMÉ'"
              :severity="r.cancelled ? 'danger' : 'success'"
            />
            <div>{{ r.final_price }} €</div>
          </div>
        </div>
      </div>
    </aside>

    <main class="grow bg-white border border-surface rounded-lg p-2 md:p-4">
      <!-- affichage de la fiche de détail de l'inscription avec les paiements ? -->

      <div v-if="!currentRegistration" class="flex items-center justify-center">
        Vous pouvez choisir une inscription via le listing de gauche.
      </div>

      <template v-else>
        <header>
          <div class="text-2xl leading-8 text-color font-medium">
            Fiche d'inscription de {{ currentRegistration.membership_person!.lastname }}
            {{ currentRegistration.membership_person!.firstname }}
          </div>
        </header>

        <div>
          Famille
          {{ currentRegistration.membership_person?.membership?.lastname }}
          {{ currentRegistration.membership_person?.membership?.firstname }}
          <br />
          {{ currentRegistration.membership_person?.membership?.tel_1 }}
          {{ currentRegistration.membership_person?.membership?.tel_2 }}
          <br />
          {{ currentRegistration.membership_person?.membership?.email_1 }}
          {{ currentRegistration.membership_person?.membership?.email_2 }}
          <br />

          {{ currentRegistration.membership_person?.membership?.zipcode }}
          {{ currentRegistration.membership_person?.membership?.city }}
        </div>

        <div
          class="flex rounded-md p-2 flex-wrap"
          :class="{
            'bg-orange-200': currentRegistration.cancelled
          }"
        >
          <section
            v-if="currentRegistration.cancelled"
            class="font-semibold w-full text-center text-lg my-2"
          >
            Annulée le {{ currentRegistration.cancelation_date }} pour motif
            {{ currentRegistration.cancelation_reason }}
          </section>
          <div class="w-1/2">
            <span class="font-semibold">Cours :</span>
            {{ currentRegistration.activity_course!.name }}
          </div>
          <div class="w-1/2" v-if="currentRegistration.activity_instrument">
            <span class="font-semibold">Instrument :</span>
            {{ currentRegistration.activity_instrument.name }}
          </div>
          <div class="w-full">
            Choix d'ateliers

            <ol>
              <li>{{ currentRegistration.workshop_choice_1 }}</li>
              <li>{{ currentRegistration.workshop_choice_2 }}</li>
              <li>{{ currentRegistration.workshop_choice_3 }}</li>
            </ol>
          </div>
          <div class="w-full flex justify-between">
            <span class="font-semibold">Prix tranche 1 :</span>
            {{ currentRegistration.activity_course!.price_quotient1 }} €
            <span class="font-semibold">Prix tranche 2 :</span>
            {{ currentRegistration.activity_course!.price_quotient2 }} €
            <span class="font-semibold">Prix tranche 3 :</span>
            {{ currentRegistration.activity_course!.price_quotient3 }} €
            <span class="font-semibold">Prix tranche 4 :</span>
            {{ currentRegistration.activity_course!.price_quotient4 }}
            €
          </div>

          <div class="w-full flex justify-between">
            <span class="font-semibold">Prix selon QF :</span>
            {{ currentRegistration.price }} €
            <span class="font-semibold">Réduction si plus d'une inscription :</span>
            {{ currentRegistration.discount }} %
            <span class="font-semibold">Prix final :</span>
            {{ currentRegistration.final_price }} €
          </div>
        </div>

        <!-- <prime-datatable
          :value="registrations?.data"
          tableStyle="min-width: 50rem"
          :loading="loading"
          show-grid-lines
          paginator
          lazy
          :rows="20"
          :total-records="registrations?.total"
        >
          <prime-column field="activity_course.name" header="Activité"></prime-column>
          <prime-column field="price" header="Montant inscription">
            <template #body="slotProps">
              {{ slotProps.data.price.toLocaleString('en-US', { style: 'currency', currency: 'EUR' }) }} €

            </template>
          </prime-column>
          <prime-column field="cancelled" header="Annulation">
            <template #body="slotProps">
              <prime-tag
                :value="slotProps.data.cancelled ? 'OUI' : 'NON'"
                :severity="slotProps.data.cancelled ? 'danger' : 'success'"
              />
            </template>
          </prime-column>
          <prime-column field="information" header="Information">
          </prime-column>
        </prime-datatable> -->
      </template>
    </main>
  </div>
</template>

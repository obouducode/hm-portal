<script setup lang="ts">
import { definePage } from 'unplugin-vue-router/runtime'
import { onMounted, ref, watch } from 'vue'
import { lckWorkspaceHM } from '@/sdk/lckWorkspaceHM'

import PrimeDatatable from 'primevue/datatable'
import PrimeColumn from 'primevue/column'
import PrimeButton from 'primevue/button'
import PrimePaginator, { type PageState } from 'primevue/paginator'
import PrimeInputText from 'primevue/inputtext'
import PrimeInputNumber from 'primevue/inputnumber'
import PrimeSelect from 'primevue/select'
import PrimeTag from 'primevue/tag'
import { paymentStepFields } from '../famille/membershipFieldsTypes'

import DataForm from '@/components/data-form.vue'

import { type Paginated } from '@feathersjs/feathers'
import { headers } from '@/sdk'
import { useStoreGlossary } from '@/stores/glossaries'
import { useToast } from 'primevue'
// import PrimeDialog from 'primevue/dialog'
import PrimeMessage from 'primevue/message'

definePage({
  meta: {
    requireAuth: true
  }
})
const { glossaryState, fetch: fetchGlossary } = useStoreGlossary()
const toast = useToast()

const loading = ref(false)
const payments = ref<Paginated<MsPayment>>({
  total: 0,
  limit: 100,
  skip: 0,
  data: []
})
const status = ref([
  { name: 'Complet', code: 'COMPLETED', class: 'bg-green-300 text-green-900' },
  { name: 'Manque informations', code: 'MISSING_INFO', class: 'bg-orange-300 text-orange-900'  },
  { name: 'Manque paiement', code: 'MISSING_MONEY', class: 'bg-orange-300 text-orange-900'  },
  { name: 'Aucun paiement', code: 'NO_MONEY', class: 'bg-orange-300 text-orange-900'  },
  { name: 'À vérifier', code: 'TO_CHECK', class: 'bg-orange-300 text-orange-900'  },
])
const statusByCode = status.value.reduce((acc, s) => {
  acc[s.code] = s
  return acc
}, {} as Record<string, {name: string, code: string}>)
const glossaries = ref<{
  seasons: MsSeason[]
  status: {id: string, slug: string, name: string}[]
}>({
  seasons: [],
  status: status.value.reduce(
    (acc, s) => {
      acc.push({
        id: s.code,
        slug: s.code,
        name: s.name,
      })
      return acc
    },
    [] as {id: string, slug: string, name: string}[]
  )
})
const filters = ref<{
  search?: string
  season?: string
  status?: string
}>({
  season: 'fbe54af7-8627-4d56-bb49-e76e5626e812' // saison 2025 2026
})
const editingRows = ref()

const pagination = ref({
  limit: 20,
  skip: 0
})

const currentPayment = ref<MsPayment>()

async function loadGlossaries() {
  loading.value = true
  try {
    const seasons = await lckWorkspaceHM.glossaries.season.record.find({
      headers
    })
    glossaries.value.seasons = seasons.data
  } catch (e) {
    console.error(e)
  }
  loading.value = false
}

async function findPayments() {
  loading.value = true
  try {
    const queryFilters: Record<string, unknown> = {}
    if (filters.value.search)
      queryFilters['membership.lastname'] = {
        $ilike: '%' + filters.value.search + '%'
      }
    if (filters.value.season) {
      queryFilters['season_id'] = filters.value.season
    }
    if (filters.value.status) {
      queryFilters['status'] = filters.value.status
    }
    payments.value = await lckWorkspaceHM.tables.payment.record.find({
      query: {
        $fetch: '[membership]',
        $limit: pagination.value.limit,
        $skip: pagination.value.skip,
        // need to be implement in LocoKit engine first
        // see https://github.com/locokit/locokit/issues/378
        // $sort: {
        //   'activity_course.slug': 1,
        //   lastname: 1
        // },
        ...queryFilters
      },
      headers
    })
  } catch (e) {
    console.error(e)
  }
  loading.value = false
}

async function findPayment(id: string) {
  loading.value = true
  try {
    currentPayment.value = await lckWorkspaceHM.tables.payment.record.get(id, {
      query: {
        $fetch: '[membership,registration.[membership_person],payment_step]',
      },
      headers
    })
  } catch (e) {
    console.error(e)
  }
  loading.value = false}


/**
 * Engistrement des modifications des infos de l'adhésion
 */
async function onSaveAdhesion(adhesion: MsPayment) {
  try {
    await lckWorkspaceHM.tables.payment.record.patch(
      adhesion.id,
      {
        information: adhesion.information,
        status: adhesion.status,
        category_price: adhesion.category_price,
        category_amount: adhesion.category_amount,
        total_amount: adhesion.total_amount,
        approval_rules: adhesion.approval_rules,
        approval_broadcast_image: adhesion.approval_broadcast_image
      },
      {
        headers
      }
    )
    toast.add({
      closable: true,
      life: 5000,
      summary: 'Mise à jour OK',
      severity: 'success',
      detail: "Les informations de l'adhésion ont bien été mises à jour."
    })
  } catch (e) {
    toast.add({
      closable: true,
      life: 5000,
      summary: 'Mise à jour NOK',
      severity: 'error',
      detail: "L'adhésion n'a pas pu être mise à jour...."
    })
  }
}

async function onSaveMembership() {
  if (!currentPayment.value) return
  try {
    const { created_at, updated_at, id, ...data } = currentPayment.value.membership!
    const membershipResult = await lckWorkspaceHM.tables.membership.record.patch(
      id,
      {
        ...data
      },
      {
        headers
      }
    )
    currentPayment.value.membership = {
      ...currentPayment.value.membership,
      ...membershipResult
    }
    toast.add({
      closable: true,
      life: 5000,
      summary: 'Mise à jour OK',
      severity: 'success',
      detail: 'Les informations ont bien été mises à jour.'
    })
  } catch (e) {
    toast.add({
      closable: true,
      life: 5000,
      summary: 'Mise à jour NOK',
      severity: 'error',
      detail: "Les informations n'ont pas pu être mise à jour...."
    })
  }
}

async function onRowEditSave(event) {
  const { id, amount, information, method, planned_receipt_date, receipt_date } = event.newData
  console.log(id, information, method, planned_receipt_date, receipt_date)
  await lckWorkspaceHM.tables.paymentStep.record.patch(
    id,
    {
      amount,
      information,
      method,
      planned_receipt_date,
      receipt_date
    },
    {
      headers
    }
  )
}
async function addPaymentStep(paymentId: string, values) {
  console.log('addPaymentStep', paymentId, values)
  await lckWorkspaceHM.tables.paymentStep.record.create(
    {
      payment_id: paymentId,
      ...values
    },
    {
      headers
    }
  )
  const paymentStepsResult = await lckWorkspaceHM.tables.paymentStep.record.find({
    query: {
      payment_id: paymentId
    },
    headers
  })
  /**
   * mise à jour des steps dans l'adhésion courante
   */
  // const currentAdhesion = currentPayment.value.find((p) => p.id === paymentId)
  currentPayment!.value!.payment_step = paymentStepsResult.data
}

/**
 * On mounted, try to load memberships,
 * according router query params
 */
onMounted(async () => {
  await loadGlossaries()
  await fetchGlossary()
  findPayments()
})
async function onPage(event: PageState) {
  pagination.value.skip = event.first
  findPayments()
}

watch(() => filters, findPayments, { deep: true })
</script>

<template>
  <header class="bg-white border-b p-2 md:p-4">
    <h1 class="text-3xl leading-8 font-medium">État des paiements</h1>
  </header>

  <div class="flex gap-4 p-4 flex-1 w-full overflow-hidden">
    <aside
      class="w-[28rem] shrink-0 bg-white border border-surface rounded-lg p-2 overflow-hidden flex flex-col"
    >
      <!-- affichage des inscriptions avec moteur de recherche et tri ? -->
      <div class="flex flex-col gap-1">
        <label for="search" class=" text-sm"> Recherche libre </label>
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
        <label for="search" class=" text-sm"> Saison </label>
        <select v-model="filters.season" class="rounded border p-1 bg-white">
          <option selected :value="null">Sélectionner une saison</option>
          <option v-for="season in glossaries.seasons" :key="season.slug" :value="season.id">
            {{ season.name }}
          </option>
        </select>
      </div>
      <div class="flex gap-2">
        <div class="w-1/2 flex flex-col gap-1">
          <label for="search" class=" text-sm"> État </label>
          <select v-model="filters.status" class="rounded border p-1 bg-white">
            <option selected :value="null">Sélectionner un état de paiement</option>
            <option
              v-for="status in glossaries.status"
              :key="status.slug"
              :value="status.id"
            >
              {{ status.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="mt-1 leading-6 text-muted-color">{{ payments.total }} élèves</div>

      <prime-paginator
        :rows="payments.limit"
        :total-records="payments.total"
        @page="onPage"
      />

      <div class="grow overflow-auto">
        <div
          class="flex gap-1 border p-2 hover:shadow-inner cursor-pointer"
          :class="{
            'bg-slate-100': currentPayment === p
          }"
          v-for="p in payments?.data"
          :key="'p_' + p.id"
          @click="findPayment(p.id)"
        >
          <div class="flex flex-col gap-1 items-left grow">
            <div class="text-base font-medium">
              {{ p.membership!.lastname }} {{ p.membership!.firstname }}
            </div>
          </div>
          <div class="flex flex-col gap-1 items-right text-right">
            <prime-tag
              :value="statusByCode[p.status].name"
              :severity="p.status === 'COMPLETED' ? 'success' : 'warn'"
            />
            {{ p.total_amount }} €
          </div>
        </div>
      </div>
    </aside>

    <main class="grow bg-white border border-surface rounded-lg p-2 md:p-4 overflow-auto">
      <!-- affichage de la fiche de détail de l'inscription avec les paiements ? -->

      <div v-if="!currentPayment" class="flex items-center justify-center">
        Vous pouvez choisir une inscription via le listing de gauche.
      </div>

      <template v-else>
        <header>
          <div class="text-3xl mb-4 leading-8 font-medium flex items-center">
            {{ currentPayment.membership!.lastname }} {{ currentPayment.membership!.firstname }}

            <prime-message
              class="ml-auto"
              :severity="
                currentPayment.status === 'COMPLETED'
                  ? 'success'
                  : currentPayment.status === 'NO_MONEY'
                    ? 'danger'
                    : 'warn'
              "
            >
              {{ statusByCode[currentPayment.status].name }}
            </prime-message>
          </div>
        </header>

        <h2 class="text-2xl ">Fiche de renseignements</h2>
        <section class="border rounded-lg bg-white p-4 my-4 flex flex-col gap-2 items-center">
          <div class="flex flex-wrap gap-4">
            <div class="flex flex-col gap-2 mb-4">
              <label class="font-semibold">Identité</label>
              <prime-input-text v-model="currentPayment!.membership.firstname" autocomplete="off" />
              <prime-input-text v-model="currentPayment!.membership.lastname" autocomplete="off" />
            </div>

            <div class="flex flex-col gap-2 mb-4 w-30">
              <label class="font-semibold">Téléphone(s)</label>
              <prime-input-text v-model="currentPayment!.membership.tel_1" autocomplete="off" />
              <prime-input-text v-model="currentPayment!.membership.tel_2" autocomplete="off" />
            </div>

            <div class="flex flex-col gap-2 mb-4 w-60">
              <label class="font-semibold">Courriel(s)</label>
              <prime-input-text v-model="currentPayment!.membership.email_1" autocomplete="off" />
              <prime-input-text v-model="currentPayment!.membership.email_2" autocomplete="off" />
            </div>

            <div class="flex flex-col gap-2 mb-4">
              <label class="font-semibold">Adresse</label>
              <prime-input-text v-model="currentPayment!.membership.address" autocomplete="off" />
              <div>
                <prime-input-text
                  v-model="currentPayment!.membership.zipcode"
                  autocomplete="off"
                  class="w-20 mr-2"
                />
                <prime-input-text v-model="currentPayment!.membership.city" autocomplete="off" />
              </div>
            </div>
          </div>

          <prime-button @click="onSaveMembership"> Enregistrer </prime-button>
        </section>

        <h2 class="text-2xl my-2 flex items-center">
          Adhésion
        </h2>

        <section class="my-4">
          <div
            :key="currentPayment.id"
            class="border rounded-lg bg-white p-4 p-2 md:p-4 mb-2"
          >
            <div class="w-full">
              Enregistré le
              {{ currentPayment.created_at }}

              <div class="flex flex-col justify-center">
                <div class="flex gap-4 items-stretch">
                  <div class="grow flex flex-col gap-1">
                    <label for="information" class="font-semibold">Informations</label>
                    <textarea
                      id="information"
                      v-model="currentPayment.information"
                      class="w-full border rounded p-2 h-full"
                    />
                  </div>

                  <div class="flex flex-col gap-4 w-full lg:w-1/4">
                    <div class="flex flex-col gap-1">
                      <label for="category_price" class="font-semibold"
                        >Tranche de prix (1 à 4)</label
                      >
                      <prime-input-number
                        id="category_price"
                        v-model="currentPayment.category_price"
                        autocomplete="off"
                      />
                    </div>
                    <div class="flex flex-col gap-1">
                      <label for="category_amount" class="font-semibold"
                        >Montant du quotient familial</label
                      >
                      <prime-input-number
                        id="category_amount"
                        v-model="currentPayment.category_amount"
                        autocomplete="off"
                      />
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        v-model="currentPayment.approval_broadcast_image"
                        class="mr-2"
                      />
                      <label>Droit à la diffusion de l'image</label>
                    </div>
                  </div>

                  <div class="flex flex-col gap-4 w-full lg:w-1/4">
                    <div class="flex flex-col gap-1">
                      <label for="category_amount" class="font-semibold">
                        Montant total de l'adhésion
                      </label>
                      <prime-input-number
                        id="category_amount"
                        mode="currency"
                        currency="EUR"
                        locale="fr-FR"
                        v-model="currentPayment.total_amount"
                        autocomplete="off"
                      />
                    </div>
                    <div class="flex flex-col gap-1">
                      <label class="font-semibold w-24">Statut</label>
                      <prime-select
                        :options="status"
                        option-label="name"
                        option-value="code"
                        v-model="currentPayment.status"
                      />
                    </div>
                    <div>
                      <input type="checkbox" v-model="currentPayment.approval_rules" class="mr-2" />
                      <label>Respect du règlement</label>
                    </div>
                  </div>
                </div>

                <prime-button class="mt-4 mx-auto" @click="onSaveAdhesion(currentPayment)">
                  Enregistrer
                </prime-button>
              </div>

              <h3 class="text-xl my-4">Inscriptions</h3>
              <div class="flex flex-col gap-1">
                <div
                  v-for="registration in currentPayment.registration"
                  :key="registration.id"
                  class="p-3 border rounded-lg"
                  :class="{
                    'bg-orange-200': registration.cancelled
                  }"
                >
                  <div class="flex justify-between items-center mb-2">
                    <h2 class="text-2xl text-primary">
                      {{ registration.membership_person?.lastname }}
                      {{ registration.membership_person?.firstname }}
                    </h2>
                  </div>

                  <section
                    v-if="registration.cancelled"
                    class="font-semibold w-full text-center text-lg my-2"
                  >
                    Annulée le {{ registration.cancelation_date }} pour motif
                    {{ registration.cancelation_reason }}
                  </section>

                  <div class="flex flex-col gap-2 items-center w-full">
                    <div class="flex gap-2 w-full">
                      <div class="grow">
                        <span class="font-semibold">Informations :</span><br />

                        <textarea
                          class="w-full border rounded p-2 h-32"
                          v-model="registration.information"
                        ></textarea>
                      </div>

                      <div class="w-full lg:w-1/5">
                        <div v-if="glossaryState.courses[registration.activity_course_id]">
                          <span class="font-semibold">Cours :</span>
                          {{ glossaryState.courses[registration.activity_course_id].name }}
                        </div>
                        <div
                          v-if="registration.activity_instrument_id && glossaryState.instruments[registration.activity_instrument_id]"
                        >
                          <span class="font-semibold">Instrument :</span>
                          {{
                            glossaryState.instruments[registration.activity_instrument_id]?.name
                          }}
                        </div>

                        <div v-if="glossaryState.courses[registration.activity_course_id]">
                          <span class="font-semibold">Tranche 1 :</span>
                          {{
                            glossaryState.courses[registration.activity_course_id].price_quotient1
                          }}
                          €
                          <br />
                          <span class="font-semibold">Tranche 2 :</span>
                          {{
                            glossaryState.courses[registration.activity_course_id].price_quotient2
                          }}
                          €
                          <br />
                          <span class="font-semibold">Tranche 3 :</span>
                          {{
                            glossaryState.courses[registration.activity_course_id].price_quotient3
                          }}
                          €
                          <br />
                          <span class="font-semibold">Tranche 4 :</span>
                          {{
                            glossaryState.courses[registration.activity_course_id].price_quotient4
                          }}
                          €
                        </div>
                      </div>

                      <div class="w-full lg:w-1/5">
                        <span class="font-semibold">Prix selon QF :</span>
                        {{ registration.price }} €
                        <br />
                        <span class="font-semibold">Réduction :</span>
                        {{ registration.discount }} %
                        <br />
                        <span class="font-semibold">Prix final :</span>
                        {{ registration.final_price }} €
                      </div>
                      <div class="w-full lg:w-1/5">
                        <span class="font-semibold">Ateliers</span>
                        <div>{{ registration.workshop_choice_1 }}</div>
                        <div>{{ registration.workshop_choice_2 }}</div>
                        <div>{{ registration.workshop_choice_3 }}</div>

                        <input
                          type="checkbox"
                          v-model="registration.activity_want_music_book"
                          class="mr-2"
                        />
                        <span>souhaite le livret FM</span>
                        (année {{ registration.activity_teach_year }})
                        <br />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h3 class="text-xl my-4">Paiements</h3>
              <prime-datatable
                :value="currentPayment.payment_step"
                v-model:editingRows="editingRows"
                @row-edit-save="onRowEditSave"
                editMode="row"
                dataKey="id"
                :pt="{
                  table: { style: 'min-width: 50rem' },
                  column: {
                    bodycell: ({ state }) => ({
                      style: state['d_editing'] && 'padding-top: 0.75rem; padding-bottom: 0.75rem'
                    })
                  }
                }"
              >
                <prime-column
                  v-for="(f, idx) in paymentStepFields"
                  :key="idx"
                  :field="f.name"
                  :header="f.label['fr-FR']"
                >
                  <template #editor="{ data, field }">
                    <prime-input-number
                      v-if="f.input === 'number'"
                      v-bind="f.attributes"
                      v-model="data[field]"
                      fluid
                    />
                    <prime-input-text
                      v-else-if="f.input === 'oneline-text'"
                      v-bind="f.attributes"
                      v-model="data[field]"
                      fluid
                    />

                    <prime-input-text
                      v-else-if="f.input === 'date'"
                      v-model="data[field]"
                      type="date"
                    />

                    <select v-model="data[field]" v-else-if="f.input === 'single-data'">
                      <option
                        v-for="choice in f.values"
                        :key="choice.value"
                        :value="choice.value"
                      >
                        {{ choice.label['fr-FR'] }}
                      </option>
                    </select>
                  </template>
                </prime-column>
                <prime-column
                  :rowEditor="true"
                  style="width: 10%; min-width: 8rem"
                  bodyStyle="text-align:center"
                >
                </prime-column>
              </prime-datatable>

              <data-form
                class="mt-4"
                :step="{ fields: paymentStepFields }"
                submit-button-label="Ajouter montant"
                @submit="addPaymentStep(currentPayment.id, $event)"
              />
            </div>
          </div>
        </section>
          <!--
        <div
          class="flex rounded-md p-2 flex-wrap"
          :class="{
            'bg-orange-200': currentPayment.cancelled
          }"
        >
          <section
            v-if="currentPayment.cancelled"
            class="font-semibold w-full text-center text-lg my-2"
          >
            Annulée le {{ currentPayment.cancelation_date }} pour motif
            {{ currentPayment.cancelation_reason }}
          </section>
          <div class="w-1/2">
            <span class="font-semibold">Cours :</span>
            {{ currentPayment.activity_course!.name }}
          </div>
          <div class="w-1/2" v-if="currentPayment.activity_instrument">
            <span class="font-semibold">Instrument :</span>
            {{ currentPayment.activity_instrument.name }}
          </div>
          <div class="w-full">
            Choix d'ateliers

            <ol>
              <li>{{ currentPayment.workshop_choice_1 }}</li>
              <li>{{ currentPayment.workshop_choice_2 }}</li>
              <li>{{ currentPayment.workshop_choice_3 }}</li>
            </ol>
          </div>
          <div class="w-full flex justify-between">
            <span class="font-semibold">Prix tranche 1 :</span>
            {{ currentPayment.activity_course!.price_quotient1 }} €
            <span class="font-semibold">Prix tranche 2 :</span>
            {{ currentPayment.activity_course!.price_quotient2 }} €
            <span class="font-semibold">Prix tranche 3 :</span>
            {{ currentPayment.activity_course!.price_quotient3 }} €
            <span class="font-semibold">Prix tranche 4 :</span>
            {{ currentPayment.activity_course!.price_quotient4 }}
            €
          </div>

          <div class="w-full flex justify-between">
            <span class="font-semibold">Prix selon QF :</span>
            {{ currentPayment.price }} €
            <span class="font-semibold">Réduction si plus d'une inscription :</span>
            {{ currentPayment.discount }} %
            <span class="font-semibold">Prix final :</span>
            {{ currentPayment.final_price }} €
          </div>
        </div> -->

        <!-- <prime-datatable
          :value="payments?.data"
          tableStyle="min-width: 50rem"
          :loading="loading"
          show-grid-lines
          paginator
          lazy
          :rows="20"
          :total-records="payments?.total"
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

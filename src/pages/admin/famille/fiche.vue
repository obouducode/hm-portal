<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { lckWorkspaceHM } from '@/sdk/lckWorkspaceHM'

import PrimeDatatable from 'primevue/datatable'
import PrimeColumn from 'primevue/column'
import PrimeButton from 'primevue/button'
import PrimePaginator, { type PageState } from 'primevue/paginator'
import PrimeInputText from 'primevue/inputtext'
import PrimeInputNumber from 'primevue/inputnumber'
import PrimeSelect from 'primevue/select'

import DataForm from '@/components/data-form.vue'
import { paymentStepFields } from './membershipFieldsTypes'
import { type Paginated } from '@feathersjs/feathers'
import { useStoreGlossary } from '@/stores/glossaries'
import { useToast } from 'primevue'
import PrimeDialog from 'primevue/dialog'
import PrimeMessage from 'primevue/message'

const loading = ref(false)
const memberships = ref<Paginated<MsMembership>>({ total: 0, limit: 20, skip: 0, data: [] })
const search = ref('')
const currentMembership = ref()
const { glossaryState } = useStoreGlossary()
const toast = useToast()

const status = ref([
  { name: 'Complet', code: 'COMPLETED' },
  { name: 'Manque informations', code: 'MISSING_INFO' },
  { name: 'Manque paiement', code: 'MISSING_MONEY' },
  { name: 'Aucun paiement', code: 'NO_MONEY' },
  { name: 'À vérifier', code: 'TO_CHECK' }
])
const pagination = ref({
  limit: 20,
  skip: 0
})

async function findMembership() {
  loading.value = true
  try {
    memberships.value = await lckWorkspaceHM.tables.membership.record.find({
      query: {
        // $joinRelated: '[membership_person.[registration.[activity_course]],payment]',
        $fetch: '[membership_person]',
        $limit: pagination.value.limit,
        $skip: pagination.value.skip,
        /*     $sort: {
          lastname: 1
        }*/
        'membership.lastname': {
          $ilike: '%' + search.value + '%'
        }
        // $or: [
        //   {
        //   },
        //   {
        //     firstname: {
        //       $ilike: '%' + search.value + '%'
        //     }
        //   }
        // ]
      }
    })
  } catch (e) {
    console.error(e)
  }
  loading.value = false
}

const currentPayment = ref<Array<MsPayment>>([])
const editingRows = ref()
const displayedAdhesion = ref<Record<string, boolean>>({})

/**
 * Retrieve all related data to selected membership
 */
async function retrievePayment(membershipId: string) {
  /**
   * Payment with steps
   */

  /**
   * Registration of the payment
   */
  const paymentResult = await lckWorkspaceHM.tables.payment.record.find({
    query: {
      membership_id: membershipId,
      $fetch: '[payment_step,registration.[membership_person]]'
    }
  })
  currentPayment.value = paymentResult.data
  if (currentPayment.value.length > 0) {
    displayedAdhesion.value = {
      [currentPayment.value[currentPayment.value.length - 1].id]: true
    }
  }
}

async function onSaveMembership() {
  try {
    const { created_at, updated_at, membership_person, payment, id, ...data } =
      currentMembership.value
    const membershipResult = await lckWorkspaceHM.tables.membership.record.patch(id, {
      ...data
    })
    currentMembership.value = {
      ...currentMembership.value,
      ...membershipResult
    }
    toast.add({
      closable: true,
      life: 5000,
      summary: 'Mise à jour OK',
      severity: 'success',
      detail: "Les informations ont bien été mises à jour."
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
  await lckWorkspaceHM.tables.paymentStep.record.patch(id, {
    amount,
    information,
    method,
    planned_receipt_date,
    receipt_date
  })
}

/**
 * Engistrement des modifications des infos de l'adhésion
 */
async function onSaveAdhesion(adhesion: MsPayment) {
  try {
    await lckWorkspaceHM.tables.payment.record.patch(adhesion.id, {
      information: adhesion.information,
      status: adhesion.status,
      category_price: adhesion.category_price,
      category_amount: adhesion.category_amount,
      total_amount: adhesion.total_amount,
      approval_rules: adhesion.approval_rules,
      approval_broadcast_image: adhesion.approval_broadcast_image,
    })
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

/**
 * Engistrement des modifications des infos de l'inscription
 */
async function onSaveInscriptionInformation(id: string, information: string) {
  try {
    await lckWorkspaceHM.tables.registration.record.patch(id, {
      information
    })
    toast.add({
      closable: true,
      life: 5000,
      summary: 'Mise à jour OK',
      severity: 'success',
      detail: "Les informations de l'inscription ont bien été mises à jour."
    })
  } catch (e) {
    toast.add({
      closable: true,
      life: 5000,
      summary: 'Mise à jour NOK',
      severity: 'error',
      detail: "L'inscription n'a pas pu être mise à jour...."
    })
  }
}

const showDialogAnnulationInscription = ref(false)
const currentInscriptionAAnnuler = ref<MsRegistration>()
function onDisplayDialogAnnulationInscription(registration: MsRegistration) {
  showDialogAnnulationInscription.value = true
  currentInscriptionAAnnuler.value = registration
}
/**
 * Engistrement des modifications des infos de l'adhésion
 */
async function onCancelInscription() {
  if (!currentInscriptionAAnnuler.value) return
  try {
    await lckWorkspaceHM.tables.registration.record.patch(currentInscriptionAAnnuler.value.id, {
      cancelation_date: currentInscriptionAAnnuler.value.cancelation_date,
      cancelation_reason: currentInscriptionAAnnuler.value.cancelation_reason,
      cancelled: true
    })
    showDialogAnnulationInscription.value = false
    toast.add({
      closable: true,
      life: 5000,
      summary: 'Annulation inscription OK',
      severity: 'success',
      detail: "L'inscription a bien été annulée."
    })
  } catch (e) {
    toast.add({
      closable: true,
      life: 5000,
      summary: 'Annulation inscription NOK',
      severity: 'error',
      detail: "L'inscription n'a pas pu être annulée...."
    })
  }
}

/**
 * On mounted, try to load memberships,
 * according router query params
 */
onMounted(() => {
  findMembership()
})

async function addPaymentStep(paymentId: string, values) {
  console.log('addPaymentStep', paymentId, values)
  await lckWorkspaceHM.tables.paymentStep.record.create({
    payment_id: paymentId,
    ...values
  })
  const paymentStepsResult = await lckWorkspaceHM.tables.paymentStep.record.find({
    query: {
      payment_id: paymentId
    }
  })
  /**
   * mise à jour des steps dans l'adhésion courante
   */
  const currentAdhesion = currentPayment.value.find((p) => p.id === paymentId)
  currentAdhesion!.payment_step = paymentStepsResult.data
}
function onPage(event: PageState) {
  console.log(event)
  pagination.value.skip = event.first
  findMembership()
}

async function selectMembership(m: any) {
  currentMembership.value = m
  retrievePayment(m.id)
}
</script>

<route lang="json">
{
  "meta": {
    "requiresAuth": true
  }
}
</route>

<template>
  <header class="bg-white border-b p-2 md:p-4">
    <h1 class="text-3xl leading-8 text-color font-medium">Fiches familles</h1>
  </header>

  <div class="flex gap-4 p-4 flex-1 w-full overflow-hidden">
    <aside
      class="w-[28rem] shrink-0 bg-white border border-surface rounded-lg p-2 overflow-hidden flex flex-col"
    >
      <!-- affichage des adhésions avec moteur de recherche et tri ? -->
      <div class="flex flex-col gap-1">
        <label for="search" class="text-color text-sm"> Recherche libre </label>
        <prime-input-text
          v-model="search"
          id="search"
          type="text"
          size="small"
          icon="pi pi-search"
          placeholder="Rechercher..."
          @input.enter="findMembership"
        />
      </div>

      <div class="mt-1 leading-6 text-muted-color">{{ memberships.total }} adhésions</div>

      <prime-paginator
        :rows="memberships.limit"
        :total-records="memberships.total"
        @page="onPage"
      />

      <div class="grow overflow-auto">
        <div
          v-for="m in memberships?.data"
          :key="m.id"
          class="flex gap-1 border p-2 hover:bg-slate-100 cursor-pointer"
          :class="{
            'bg-slate-200 hover:bg-slate-200': currentMembership === m
          }"
          @click="selectMembership(m)"
        >
          <div class="flex flex-col gap-1 items-left grow">
            <div class="text-base font-medium">{{ m.lastname }} {{ m.firstname }}</div>
            <div class="text-base text-muted-color">
              {{ m.email_1 }}
              <span v-if="m.email_2"> / {{ m.email_2 }}</span>
            </div>
          </div>
          <div class="flex gap-1 items-center text-right text-primary">
            <span v-if="m.membership_person?.length > 1">{{ m.membership_person?.length }} x </span>
            <i class="pi pi-user" />
          </div>
        </div>
      </div>
    </aside>

    <main class="grow flex flex-col h-full">
      <!-- affichage de la fiche de détail de l'inscription avec les paiements ? -->
      <!-- Membership detail, with registrations, payments, schedules, ... -->

      <div v-if="!currentMembership" class="mx-auto flex items-center justify-center h-full">
        Vous pouvez choisir une inscription via le listing de gauche.
      </div>

      <div class="h-full pt-4 w-full max-w-[80rem] mx-auto" v-else>
        <header class="h-10 text-4xl leading-8 text-color font-medium">
          {{ currentMembership.lastname }} {{ currentMembership.firstname }}
        </header>

        <div class="mt-2 overflow-auto" style="height: calc(100% - 3rem)">
          <h2 class="text-2xl text-color">Fiche de renseignements</h2>
          <section class="border rounded-lg bg-white p-4 my-4 flex flex-col gap-2 items-center">
            <div class="flex flex-wrap gap-4">
              <div class="flex flex-col gap-2 mb-4">
                <label class="font-semibold">Identité</label>
                <prime-input-text v-model="currentMembership.firstname" autocomplete="off" />
                <prime-input-text v-model="currentMembership.lastname" autocomplete="off" />
              </div>

              <div class="flex flex-col gap-2 mb-4 w-30">
                <label class="font-semibold">Téléphone(s)</label>
                <prime-input-text v-model="currentMembership.tel_1" autocomplete="off" />
                <prime-input-text v-model="currentMembership.tel_2" autocomplete="off" />
              </div>

              <div class="flex flex-col gap-2 mb-4 w-60">
                <label class="font-semibold">Courriel(s)</label>
                <prime-input-text v-model="currentMembership.email_1" autocomplete="off" />
                <prime-input-text v-model="currentMembership.email_2" autocomplete="off" />
              </div>

              <div class="flex flex-col gap-2 mb-4">
                <label class="font-semibold">Adresse</label>
                <prime-input-text v-model="currentMembership.address" autocomplete="off" />
                <div>
                  <prime-input-text
                    v-model="currentMembership.zipcode"
                    autocomplete="off"
                    class="w-20 mr-2"
                  />
                  <prime-input-text v-model="currentMembership.city" autocomplete="off" />
                </div>
              </div>
            </div>

            <prime-button @click="onSaveMembership"> Enregistrer </prime-button>
          </section>

          <h2 class="text-2xl text-color">Membres</h2>

          <section class="my-4 flex gap-1 flex-wrap">
            <!-- <template v-if="valueSelectButton.value === 1">
                <data-form
                  class="mt-4"
                  :step="{ fields: membershipFields }"
                  :initial-data="currentMembership"
                  submit-button-label="Modifier l'adhésion"
                  @submit="updateMembership"
                />
              </template>
            -->
            <div
              v-for="person in currentMembership?.membership_person"
              :key="person.id"
              class="border rounded-lg bg-white p-4 p-2 md:p-4 w-auto text-center"
            >
              <div class="text-primary">
                <i class="pi pi-user" />
                <br />
                <h2 class="text-2xl">
                  {{ person.lastname }}
                  {{ person.firstname }}
                </h2>
                {{ person.birthday.substr(0, 10) }}
              </div>
            </div>
          </section>

          <h2 class="text-2xl text-color">Adhésions</h2>

          <section class="my-4">
            <div
              v-for="adhesion in currentPayment"
              :key="adhesion.id"
              class="border rounded-lg bg-white p-4 p-2 md:p-4 mb-2"
            >
              <div
                class="flex gap-1 items-center text-right text-primary cursor-pointer"
                @click="displayedAdhesion[adhesion.id] = !displayedAdhesion[adhesion.id] ?? true"
              >
                <i
                  class="pi mr-1"
                  :class="{
                    'pi-chevron-right': !displayedAdhesion[adhesion.id],
                    'pi-chevron-down': displayedAdhesion[adhesion.id]
                  }"
                />
                <h2 class="text-2xl">
                  {{ glossaryState.seasons[adhesion.season_id]?.name }}
                </h2>
                <prime-message
                  class="ml-auto"
                  :severity="adhesion.status === 'COMPLETED' ? 'success':
                  adhesion.status === 'NO_MONEY' ? 'danger': 'warn'"
                >
                  {{adhesion.status}}
                </prime-message>
              </div>

              <div v-if="displayedAdhesion[adhesion.id]" class="w-full">
                Enregistré le
                {{ adhesion.created_at }}

                <div class="flex flex-col justify-center">
                  <div class="flex gap-4 items-stretch">
                    <div class="grow flex flex-col gap-1">
                      <label for="information" class="font-semibold">Informations</label>
                      <textarea
                        id="information"
                        v-model="adhesion.information"
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
                          v-model="adhesion.category_price"
                          autocomplete="off"
                        />
                      </div>
                      <div class="flex flex-col gap-1">
                        <label for="category_amount" class="font-semibold"
                          >Montant du quotient familial</label
                        >
                        <prime-input-number
                          id="category_amount"
                          v-model="adhesion.category_amount"
                          autocomplete="off"
                        />
                      </div>
                      <div>
                        <input
                          type="checkbox"
                          v-model="adhesion.approval_broadcast_image"
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
                          v-model="adhesion.total_amount"
                          autocomplete="off"
                        />
                      </div>
                      <div class="flex flex-col gap-1">
                        <label class="font-semibold w-24">Statut</label>
                        <prime-select
                          :options="status"
                          option-label="name"
                          option-value="code"
                          v-model="adhesion.status"
                        />
                      </div>
                      <div>
                        <input type="checkbox" v-model="adhesion.approval_rules" class="mr-2" />
                        <label>Respect du règlement</label>
                      </div>
                    </div>
                  </div>

                  <prime-button
                    class="mt-4 mx-auto"
                    @click="onSaveAdhesion(adhesion)"
                  >
                    Enregistrer
                  </prime-button>
                </div>

                <h3 class="text-xl my-4">Inscriptions</h3>
                <div class="flex flex-col gap-1">
                  <div
                    v-for="registration in adhesion.registration"
                    :key="registration.id"
                    class="p-3 border rounded-lg"
                    :class="{
                      'bg-orange-200': registration.cancelled
                    }"
                  >
                    <div class="flex justify-between items-center mb-2">
                      <h2 class="text-2xl text-primary">
                        {{ registration.membership_person.lastname }}
                        {{ registration.membership_person.firstname }}
                      </h2>
                      <prime-button
                        v-if="!registration.cancelled"
                        severity="warn"
                        variant="outlined"
                        @click="onDisplayDialogAnnulationInscription(registration)"
                        >Annuler l'inscription</prime-button
                      >
                      <prime-dialog
                        v-model:visible="showDialogAnnulationInscription"
                        modal
                        header="Annuler l'inscription "
                        :style="{ width: '32rem' }"
                      >
                        <div v-if="!currentInscriptionAAnnuler">Aucune inscription à annuler ?</div>
                        <template v-else>
                          <div class="flex flex-col w-full gap-2 mb-4">
                            <label for="cancelation_date" class="font-semibold"
                              >Date d'annulation</label
                            >
                            <prime-input-text
                              v-model="currentInscriptionAAnnuler.cancelation_date"
                              autocomplete="off"
                              type="date"
                            />
                          </div>
                          <div class="flex flex-col w-full gap-2 mb-8">
                            <label for="cancelation_reason" class="font-semibold"
                              >Motif d'annulation</label
                            >
                            <textarea
                              v-model="currentInscriptionAAnnuler.cancelation_reason"
                              class="border rounded p-2 h-64"
                              autocomplete="off"
                            ></textarea>
                          </div>
                          <div class="flex justify-end gap-2">
                            <prime-button
                              type="button"
                              label="Annuler l'inscription"
                              severity="danger"
                              variant="outlined"
                              @click="onCancelInscription"
                            ></prime-button>
                          </div>
                        </template>
                      </prime-dialog>
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
                            v-if="glossaryState.instruments[registration.activity_instrument_id]"
                          >
                            <span class="font-semibold">Instrument :</span>
                            {{
                              glossaryState.instruments[registration.activity_instrument_id].name
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

                      <prime-button
                        @click="
                          onSaveInscriptionInformation(registration.id, registration.information)
                        "
                        >Enregistrer</prime-button
                      >
                    </div>
                  </div>
                </div>

                <h3 class="text-xl my-4">Paiements</h3>
                <prime-datatable
                  :value="adhesion.payment_step"
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
                  @submit="addPaymentStep(adhesion.id, $event)"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

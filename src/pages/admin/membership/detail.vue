<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { lckWorkspaceHM } from '@/sdk/lckWorkspaceHM'

import PrimeDatatable from 'primevue/datatable'
import PrimeColumn from 'primevue/column'
import PrimeTag from 'primevue/tag'
import PrimePaginator, { type PageState } from 'primevue/paginator'
import PrimeInputText from 'primevue/inputtext'
import PrimeSelectButton from 'primevue/selectbutton'
import PrimeInputNumber from 'primevue/inputnumber'

import DataForm from '@/components/data-form.vue'
import {
  membershipFields,
  membershipPersonFields,
  paymentStepFields,
  paymentFields
} from './membershipFieldsTypes'

const loading = ref(false)
const memberships = ref()
const search = ref('')
const currentMembership = ref()

const optionsSelectButton = ref([
  { name: 'Fiche principale', value: 1 },
  { name: 'Membres', value: 2 },
  { name: 'Facturation', value: 3 }
])
const valueSelectButton = ref({ name: 'Fiche principale', value: 1 })
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
        $joinRelated: '[payment]',
        $limit: pagination.value.limit,
        $skip: pagination.value.skip,
        lastname: {
          $ilike: '%' + search.value + '%'
        }
        /*     $sort: {
          lastname: 1
        }
        $or: [{
          lastname: {
            $unaccent: '%' + search.value + '%'
          },

        }, {
        firstname: {
            $unaccent: '%' + search.value + '%'
          },
        }]*/
      }
    })
  } catch (e) {
    console.error(e)
  }
  loading.value = false
}

const paymentSteps = ref([{}])
const editingRows = ref()
async function retreiveMembershipPerson() {
  const paymentStepsResult = await lckWorkspaceHM.tables.paymentStep.record.find({
    query: {
      payment_id: currentMembership.value.payment[0].id
    }
  })
  paymentSteps.value = paymentStepsResult.data
  const membershipPersonsResult = await lckWorkspaceHM.tables.membership_person.record.find({
    query: {
      membership_family_id: currentMembership.value.id
    }
  })
  currentMembership.value.membership_person = membershipPersonsResult.data
  optionsSelectButton.value[1].name = 'Membres (' + membershipPersonsResult.data.length + ')'
}
async function onRowEditSave(event) {
  console.log(event)
}

/**
 * On mounted, try to load memberships,
 * according router query params
 */
onMounted(findMembership)

async function addPaymentStep(paymentId, values) {
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
  paymentSteps.value = paymentStepsResult.data
}
function onPage(event: PageState) {
  console.log(event)
  pagination.value.skip = event.first
  findMembership()
}

async function selectMembership(m: any) {
  currentMembership.value = m
  await retreiveMembershipPerson(m.id)
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
  <div class="flex gap-4 size-full">
    <aside class="min-w-[28rem] h-full">
      <header class="h-10">
        <div class="text-2xl leading-8 text-color font-medium">
          {{ memberships.total }} adhésions
        </div>
      </header>

      <div
        class="flex flex-col bg-white border border-surface rounded-lg p-2"
        style="height: calc(100% - 3rem)"
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

        <prime-paginator
          :rows="memberships.limit"
          :total-records="memberships.total"
          @page="onPage"
        />

        <div class="overflow-auto">
          <div
            v-for="(m, idx) in memberships?.data"
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
              </div>
            </div>
            <div class="flex flex-col gap-1 items-right text-right">
              <prime-tag
                :value="
                  m.membership_person?.length +
                  ' membre' +
                  (m.membership_person?.length > 1 ? 's' : '')
                "
                :severity="m.membership_person?.length > 1 ? 'success' : 'info'"
              />
              {{ m.payment.length }}
            </div>
          </div>
        </div>
      </div>
    </aside>

    <main class="size-full">
      <!-- affichage de la fiche de détail de l'inscription avec les paiements ? -->
      <!-- Membership detail, with registrations, payments, schedules, ... -->

      <div
        v-if="!currentMembership"
        class="w-[56rem] mx-auto flex items-center justify-center h-full"
      >
        Vous pouvez choisir une inscription via le listing de gauche.
      </div>

      <div class="h-full" v-else>
        <header class="w-[56rem] mx-auto h-10 flex items-center justify-between">
          <div class="text-2xl leading-8 text-color font-medium">
            Fiche d'adhésion de {{ currentMembership.lastname }} {{ currentMembership.firstname }}
          </div>
          <!-- <div class="mt-1 leading-6 text-muted-color">
            Information particulière ?
          </div> -->

          <prime-select-button
            v-model="valueSelectButton"
            :options="optionsSelectButton"
            optionLabel="name"
            aria-labelledby="basic"
          />
        </header>

        <div class="mt-2 overflow-auto" style="height: calc(100% - 3rem)">
          <div
            class="w-[56rem] flex flex-col mx-auto bg-white border border-surface rounded-lg p-2 md:p-4"
          >
            <template v-if="valueSelectButton.value === 1">
              <data-form
                class="mt-4"
                :step="{ fields: membershipFields }"
                :initial-data="currentMembership"
                submit-button-label="Modifier l'adhésion"
              />
            </template>

            <template v-if="valueSelectButton.value === 2">
              <div v-for="r in currentMembership.membership_person">
                <data-form
                  class="mt-4"
                  :step="{ fields: membershipPersonFields }"
                  :initial-data="r"
                  submit-button-label="Modifier l'inscription à l'activité"
                />
                {{ r }}
              </div>
            </template>
            <template v-if="valueSelectButton.value === 3">
              <div v-for="p in currentMembership.payment">
                <data-form
                  class="mt-4"
                  :step="{ fields: paymentFields }"
                  :initial-data="p"
                  submit-button-label="Modifier le(s) mode(s) de paiement"
                />

                <data-form
                  class="mt-4"
                  :step="{ fields: paymentStepFields }"
                  submit-button-label="Ajouter montant"
                  @submit="addPaymentStep(p.id, $event)"
                />

                <prime-datatable
                  :value="paymentSteps"
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
              </div>
            </template>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

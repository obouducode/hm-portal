<script setup lang="ts">
import { definePage } from 'unplugin-vue-router/runtime'
import { onMounted, ref } from 'vue'
import { lckWorkspaceHM } from '@/sdk/lckWorkspaceHM'

import PrimeDatatable from 'primevue/datatable'
import PrimeColumn from 'primevue/column'
import PrimeTag from 'primevue/tag'
import PrimeButton from 'primevue/button'
import PrimePaginator from 'primevue/paginator'
import PrimeInputText from 'primevue/inputtext'

definePage({
  meta: {
    requireAuth: true,
  }
})

const loading = ref(false)
const error = ref<Error | null>(null)
const registrations = ref()
const search = ref('')
const currentRegistration = ref()

/**
 * On mounted, try to load memberships,
 * according router query params
 */
onMounted(async () => {
  loading.value = true
  registrations.value = await lckWorkspaceHM.tables.registration.record.find({
    query: {
      $joinRelated: '[membership_person,activity_course]'
    }
  })
  loading.value = false
})
</script>

<template>
  <header>
    <div class="text-2xl leading-8 text-color font-medium">Inscriptions</div>
    <div class="mt-1 leading-6 text-muted-color">
      Le tableau liste l'ensemble des {{ registrations.total }} élèves
    </div>
  </header>

  <div class="flex gap-4 mt-10 mb-4 flex-1 w-full overflow-auto">

    <aside class="w-[24rem] bg-white border-1 border-surface rounded-lg p-2">
      <!-- affichage des inscriptions avec moteur de recherche et tri ? -->
      <div class="flex flex-col gap-1">
        <label for="search" class="text-color text-sm">
          Recherche libre
        </label>
        <prime-input-text
          v-model="search"
          id="search"
          type="text"
          size="small"
          icon="pi pi-search"
          placeholder="Rechercher..."
        />
      </div>

      <prime-paginator
        :rows="registrations.limit"
        :total-records="registrations.total"
      />

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
            {{ r.membership_person.lastname }} {{ r.membership_person.firstname }}
          </div>
          <div class="text-base text-muted-color">
            {{ r.activity_course.name }}
          </div>
        </div>
        <div class="flex flex-col gap-1 items-right text-right">
          <prime-tag
            :value="r.cancelled ? 'ANNULÉ' : 'CONFIRMÉ'"
            :severity="r.cancelled ? 'danger' : 'success'"
          />
          <div>
            {{ r.price }} €
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
            Fiche d'inscription de {{ currentRegistration.membership_person.lastname }} {{ currentRegistration.membership_person.firstname }}
          </div>
          <div class="mt-1 leading-6 text-muted-color">
            Le tableau liste l'ensemble des {{ registrations.total }} élèves
          </div>
        </header>


        {{ currentRegistration }}
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
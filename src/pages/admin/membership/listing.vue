<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { lckWorkspaceHM } from '@/sdk/lckWorkspaceHM'

import PrimeDatatable from 'primevue/datatable'
import PrimeColumn from 'primevue/column'
import type { PageState } from 'primevue/paginator'

const loading = ref(false)
const memberships = ref()
const search = ref('')
const pagination = ref({
  limit: 200,
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
onMounted(findMembership)
function onPage(event: PageState) {
  pagination.value.skip = event.first
  findMembership()
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
  <main class="size-full overflow-auto">
    <prime-datatable
      lazy
      :value="memberships.data"
      :loading="loading"
      show-grid-lines
      striped-rows
      paginator
      :rows="pagination.limit"
      :total-records="memberships.total"
      class="border h-full"
      pt:tableContainer="h-fit"
      @page="onPage"
    >
      <prime-column field="lastname" header="NOM"> </prime-column>
      <prime-column field="firstname" header="Prénom"> </prime-column>
      <prime-column field="email_1" header="Mail n°1"> </prime-column>
      <prime-column field="email_2" header="Mail n°2"> </prime-column>
      <prime-column field="tel_1" header="Tél n°1"> </prime-column>
      <prime-column field="tel_2" header="Tél n°2"> </prime-column>
      <prime-column field="zipcode" header="Code postal"> </prime-column>
      <prime-column field="city" header="Ville"> </prime-column>
      <prime-column field="family_quotient" header="Quotient familial"> </prime-column>
    </prime-datatable>
  </main>
</template>

<style lang="css" scoped>
:deep(.p-datatable-paginator-bottom) {
  height: 4rem;
  position: sticky;
  bottom: 0;
}
:deep(.p-datatable-thead) {
  border-bottom-width: 1px;
  box-shadow: 0 0 5px gray;
}
:deep(.p-datatable-table-container) {
  height: calc(100% - 4rem);
}
:deep(.p-datatable-thead) {
  top: 0;
}
</style>

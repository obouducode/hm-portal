<script setup lang="ts">
import { definePage } from 'unplugin-vue-router/runtime'
import { onMounted, ref } from 'vue'
import { lckWorkspaceHM } from '@/sdk/lckWorkspaceHM'
import PrimeDatatable from 'primevue/datatable'
import PrimeColumn from 'primevue/column'
import PrimeTag from 'primevue/tag'
import type { PageState } from 'primevue/paginator'

definePage({
  meta: {
    requireAuth: true
  }
})

const loading = ref(false)
const payments = ref()
const expandedRows = ref({})
const pagination = ref({
  limit: 200,
  skip: 0
})

async function findPayments() {
  loading.value = true
  try {
    payments.value = await lckWorkspaceHM.tables.payment.record.find({
      query: {
        $fetch: '[payment_step]',
        $limit: pagination.value.limit,
        $skip: pagination.value.skip
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
onMounted(findPayments)
function onPage(event: PageState) {
  pagination.value.skip = event.first
  findPayments()
}
</script>

<template>
  <main class="size-full overflow-auto">
    <prime-datatable
      lazy
      :value="payments.data"
      :loading="loading"
      show-grid-lines
      striped-rows
      paginator
      :rows="pagination.limit"
      :total-records="payments.total"
      class="border h-full"
      pt:tableContainer="h-fit"
      @page="onPage"
      v-model:expandedRows="expandedRows"
      dataKey="id"
    >
      <prime-column expander style="width: 5rem" />
      <prime-column field="method" header="Méthode">
        <template #body="slotProps">
          {{ slotProps.data.method }}
        </template>
      </prime-column>
      <prime-column field="information" header="Information">
        <template #body="slotProps">
          {{ slotProps.data.information }}
        </template>
      </prime-column>
      <template #expansion="slotProps">
        <div class="p-4">
          <h5>Étapes de paiement</h5>
          <prime-datatable :value="slotProps.data.payment_steps">
            <prime-column field="method" header="Méthode" sortable></prime-column>
            <prime-column field="amount" header="Montant" sortable></prime-column>
            <prime-column field="information" header="Information" sortable></prime-column>
            <prime-column
              field="planned_receipt_date"
              header="Date prévue d'encaissement"
              sortable
            ></prime-column>
          </prime-datatable>
        </div>
      </template>
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

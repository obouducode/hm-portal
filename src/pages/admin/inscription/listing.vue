<script setup lang="ts">
import { definePage } from 'unplugin-vue-router/runtime'
import { onMounted, ref, watch } from 'vue'
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
const registrations = ref({
  total: 0,
  data: []
})
const glossaries = ref<{
  seasons: MsSeason[]
}>({
  seasons: []
})
const filters = ref<{
  search?: string
  season?: string
}>({})

const pagination = ref({
  limit: 50,
  skip: 0
})

async function loadGlossaries() {
  loading.value = true
  try {
    const seasons = await lckWorkspaceHM.glossaries.season.record.find()
    glossaries.value.seasons = seasons.data
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
      queryFilters.lastname = {
        $ilike: '%' + filters.value.search + '%'
      }
    if (filters.value.season) {
      queryFilters['activity_course.season_id'] = filters.value.season
    }
    registrations.value = await lckWorkspaceHM.tables.registration.record.find({
      query: {
        $fetch: '[membership_person,activity_course]',
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
  <main class="size-full overflow-auto">
    <input type="text" v-model="filters.search" />
    <select v-model="filters.season">
      <option></option>
      <option v-for="season in glossaries.seasons" :key="season.slug" :value="season.id">
        {{ season.name }}
      </option>
    </select>
    <prime-datatable
      lazy
      :value="registrations.data"
      :loading="loading"
      show-grid-lines
      striped-rows
      paginator
      :rows="pagination.limit"
      :total-records="registrations.total"
      class="border h-full"
      pt:tableContainer="h-fit"
      @page="onPage"
    >
      <prime-column field="lastname" header="NOM">
        <template #body="slotProps">
          {{ slotProps.data.membership_person.lastname }}
        </template>
      </prime-column>
      <prime-column field="firstname" header="Prénom">
        <template #body="slotProps">
          {{ slotProps.data.membership_person.firstname }}
        </template>
      </prime-column>
      <prime-column field="birthday" header="Date de naissance">
        <template #body="slotProps">
          {{ slotProps.data.birthday }}
        </template>
      </prime-column>
      <prime-column field="activity_course.name" header="Activité"></prime-column>
      <prime-column field="price" header="Montant inscription">
        <template #body="slotProps"> {{ slotProps.data.price }} € </template>
      </prime-column>
      <prime-column field="cancelled" header="Annulation">
        <template #body="slotProps">
          <prime-tag
            :value="slotProps.data.cancelled ? 'OUI' : 'NON'"
            :severity="slotProps.data.cancelled ? 'danger' : 'success'"
          />
        </template>
      </prime-column>
      <prime-column field="information" header="Information"> </prime-column>
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

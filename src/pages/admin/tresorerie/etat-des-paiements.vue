<script setup lang="ts">
import { definePage } from 'unplugin-vue-router/runtime'
import { computed, onMounted, ref, watch } from 'vue'
import { format } from 'date-fns'
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
import {
  teach_years,
  workshops as workshops2026
} from '@/pages/registration/form-record-data-2026-2027'
import { workshops as workshops2025 } from '@/pages/registration/form-record-data-2025-2026'

import DataForm from '@/components/data-form.vue'

import { type Paginated } from '@feathersjs/feathers'
import { headers } from '@/sdk'
import { useStoreGlossary } from '@/stores/glossaries'
import { useToast, useConfirm } from 'primevue'
// import PrimeDialog from 'primevue/dialog'
import PrimeMessage from 'primevue/message'
import ConfirmDialog from 'primevue/confirmdialog'

definePage({
  meta: {
    requireAuth: true
  }
})
const { glossaryState, fetch: fetchGlossary } = useStoreGlossary()
const toast = useToast()
const confirm = useConfirm()

/**
 * Options for the editable course / instrument selects,
 * derived from the glossary loaded in store and scoped to the
 * season of the currently selected payment.
 *
 * If a glossary isn't season-scoped (no season_id on its items),
 * we keep all of its entries.
 */
function filterOptionsBySeason(items: any[]): any[] {
  const seasonId = currentPayment.value?.season_id
  if (!seasonId) return items
  const isSeasonScoped = items.some((i) => i.season_id != null)
  if (!isSeasonScoped) return items
  return items.filter((i) => i.season_id === seasonId)
}
const courseOptions = computed(() =>
  filterOptionsBySeason(Object.values(glossaryState.courses))
)
const instrumentOptions = computed(() =>
  filterOptionsBySeason(Object.values(glossaryState.instruments))
)

/**
 * Formation musicale : french labels, stable values (first_year, second...).
 */
const teachYearOptions = teach_years
const teachYearByValue = Object.fromEntries(teach_years.map((t) => [t.value, t]))
function teachYearLabel(value?: string) {
  if (!value) return '—'
  return teachYearByValue[value]?.label ?? value
}

/**
 * Workshops aren't a glossary table : they live as per-season static lists.
 * We merge both seasons (deduplicated by value) so any stored choice resolves
 * to a label and can be re-selected, whatever the season of the payment.
 */
const workshopOptions = (() => {
  const seen = new Set<string>()
  return [...workshops2026, ...workshops2025].filter((w) => {
    if (seen.has(w.value)) return false
    seen.add(w.value)
    return true
  })
})()
const workshopByValue = Object.fromEntries(workshopOptions.map((w) => [w.value, w]))
function workshopLabel(value?: string) {
  if (!value) return ''
  return workshopByValue[value]?.label ?? value
}

const loading = ref(false)
const payments = ref<Paginated<MsPayment>>({
  total: 0,
  limit: 100,
  skip: 0,
  data: []
})
const status = ref([
  { name: 'Complet', code: 'COMPLETED', class: 'bg-green-300 text-green-900' },
  { name: 'Manque informations', code: 'MISSING_INFO', class: 'bg-orange-300 text-orange-900' },
  { name: 'Manque paiement', code: 'MISSING_MONEY', class: 'bg-orange-300 text-orange-900' },
  { name: 'Aucun paiement', code: 'NO_MONEY', class: 'bg-orange-300 text-orange-900' },
  { name: 'À vérifier', code: 'TO_CHECK', class: 'bg-orange-300 text-orange-900' }
])
const statusByCode = status.value.reduce(
  (acc, s) => {
    acc[s.code] = s
    return acc
  },
  {} as Record<string, { name: string; code: string }>
)
const glossaries = ref<{
  seasons: MsSeason[]
  status: { id: string; slug: string; name: string }[]
}>({
  seasons: [],
  status: status.value.reduce(
    (acc, s) => {
      acc.push({
        id: s.code,
        slug: s.code,
        name: s.name
      })
      return acc
    },
    [] as { id: string; slug: string; name: string }[]
  )
})
const filters = ref<{
  search?: string
  season?: string
  status?: string
}>({
  season: '654a19dd-ee2a-43dd-b4b5-a69b2dbb51db' // saison 2026 2027
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
        $fetch: '[membership,registration.[membership_person],payment_step]'
      },
      headers
    })
  } catch (e) {
    console.error(e)
  }
  loading.value = false
}

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
  /**
   * Les deux dates (prévue + encaissement) sont obligatoires.
   * Si l'une manque, on ne sauvegarde pas : on réinjecte les saisies dans
   * la ligne pour ne rien perdre et on la rouvre en édition.
   */
  if (!planned_receipt_date || !receipt_date) {
    const row = currentPayment.value?.payment_step?.find((s) => s.id === id)
    if (row) Object.assign(row, event.newData)
    editingRows.value = [row ?? event.newData]
    toast.add({
      closable: true,
      life: 8000,
      summary: 'Dates obligatoires',
      severity: 'warn',
      detail: "La date prévue et la date d'encaissement sont obligatoires."
    })
    return
  }
  try {
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
    toast.add({
      closable: true,
      life: 5000,
      summary: 'Mise à jour OK',
      severity: 'success',
      detail: 'Le paiement a bien été mis à jour.'
    })
  } catch (e) {
    console.error(e)
    toast.add({
      closable: true,
      life: 8000,
      summary: 'Mise à jour NOK',
      severity: 'error',
      detail: "Le paiement n'a pas pu être mis à jour...."
    })
  }
}
async function addPaymentStep(paymentId: string, values): Promise<boolean> {
  try {
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
    currentPayment!.value!.payment_step = paymentStepsResult.data
    toast.add({
      closable: true,
      life: 5000,
      summary: 'Ajout OK',
      severity: 'success',
      detail: 'Le paiement a bien été ajouté.'
    })
    return true
  } catch (e) {
    console.error(e)
    toast.add({
      closable: true,
      life: 8000,
      summary: 'Ajout NOK',
      severity: 'error',
      detail: "Le paiement n'a pas pu être ajouté...."
    })
    return false
  }
}

/**
 * Mise à jour complète d'une inscription :
 * - les champs de l'inscription (cours, instrument, ateliers, prix...)
 * - l'identité de l'élève rattaché (table membership_person)
 *
 * Utile lorsqu'un adhérent s'est trompé lors de sa saisie.
 */
async function onSaveRegistration(registration: MsRegistration): Promise<boolean> {
  try {
    await lckWorkspaceHM.tables.registration.record.patch(
      registration.id,
      {
        activity_course_id: registration.activity_course_id,
        activity_instrument_id: registration.activity_instrument_id,
        activity_teach_year: registration.activity_teach_year,
        activity_want_music_book: registration.activity_want_music_book,
        workshop_choice_1: registration.workshop_choice_1,
        workshop_choice_2: registration.workshop_choice_2,
        workshop_choice_3: registration.workshop_choice_3,
        information: registration.information,
        price: registration.price,
        discount: registration.discount,
        final_price: registration.final_price
      },
      {
        headers
      }
    )
    if (registration.membership_person) {
      await lckWorkspaceHM.tables.membership_person.record.patch(
        registration.membership_person.id,
        {
          firstname: registration.membership_person.firstname,
          lastname: registration.membership_person.lastname,
          birthday: toDateInput(registration.membership_person.birthday) || null
        },
        {
          headers
        }
      )
    }
    toast.add({
      closable: true,
      life: 5000,
      summary: 'Mise à jour OK',
      severity: 'success',
      detail: "L'inscription a bien été mise à jour."
    })
    return true
  } catch (e) {
    console.error(e)
    toast.add({
      closable: true,
      life: 5000,
      summary: 'Mise à jour NOK',
      severity: 'error',
      detail: "L'inscription n'a pas pu être mise à jour...."
    })
    return false
  }
}

/**
 * Suppression définitive d'une inscription,
 * après confirmation de l'utilisateur.
 *
 * Utile lorsqu'une inscription a été saisie par erreur.
 */
function onDeleteRegistration(registration: MsRegistration) {
  const name =
    `${registration.membership_person?.firstname ?? ''} ${registration.membership_person?.lastname ?? ''}`.trim()
  confirm.require({
    header: "Supprimer l'inscription",
    message: `Voulez-vous vraiment supprimer définitivement l'inscription${name ? ' de ' + name : ''} ? Cette action est irréversible.`,
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Annuler',
    acceptLabel: 'Supprimer',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await lckWorkspaceHM.tables.registration.record.remove(registration.id, {
          headers
        })
        if (currentPayment.value?.registration) {
          currentPayment.value.registration = currentPayment.value.registration.filter(
            (r) => r.id !== registration.id
          )
        }
        toast.add({
          closable: true,
          life: 5000,
          summary: 'Suppression OK',
          severity: 'success',
          detail: "L'inscription a bien été supprimée."
        })
      } catch (e) {
        console.error(e)
        toast.add({
          closable: true,
          life: 5000,
          summary: 'Suppression NOK',
          severity: 'error',
          detail: "L'inscription n'a pas pu être supprimée...."
        })
      }
    }
  })
}

/**
 * Per-registration edit mode.
 * A registration is displayed read-only by default ; clicking "Modifier"
 * switches it to an editable form, and "Enregistrer" persists & exits.
 * "Annuler" restores the snapshot taken when edit started.
 */
const editingRegistrations = ref<Record<string, boolean>>({})
const registrationSnapshots = ref<Record<string, MsRegistration>>({})

function startEditRegistration(registration: MsRegistration) {
  registrationSnapshots.value[registration.id] = JSON.parse(JSON.stringify(registration))
  editingRegistrations.value[registration.id] = true
}

function cancelEditRegistration(registration: MsRegistration) {
  const snapshot = registrationSnapshots.value[registration.id]
  if (snapshot) Object.assign(registration, snapshot)
  editingRegistrations.value[registration.id] = false
  delete registrationSnapshots.value[registration.id]
}

async function saveEditRegistration(registration: MsRegistration) {
  const ok = await onSaveRegistration(registration)
  if (ok) {
    editingRegistrations.value[registration.id] = false
    delete registrationSnapshots.value[registration.id]
  }
}

/**
 * Le prix final est dérivé du prix et de la réduction (en %).
 * Recalculé à chaque modification de l'un des deux.
 */
function recomputeFinalPrice(registration: MsRegistration) {
  const price = registration.price ?? 0
  const discount = registration.discount ?? 0
  registration.final_price = Math.round(price * (1 - discount / 100) * 100) / 100
}

/**
 * Birthdays are stored as ISO strings (2012-06-27T00:00:00.000Z).
 * - formatBirthday : display in fr-FR for read-only mode
 * - toDateInput : YYYY-MM-DD expected by a native date input
 * - onBirthdayInput : write the picked date back on the person
 */
function formatBirthday(value?: string) {
  if (!value) return '—'
  try {
    return format(new Date(value), 'dd/MM/yyyy')
  } catch {
    return value
  }
}

function toDateInput(value?: string) {
  return value ? value.slice(0, 10) : ''
}

function onBirthdayInput(registration: MsRegistration, value: unknown) {
  if (registration.membership_person) {
    registration.membership_person.birthday = (value as string) || ''
  }
}

/**
 * ----- Paiements : affichage, statuts & synthèse -----
 */

/** Formatage monétaire fr-FR (1,00 €). */
const euroFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
function formatEuro(value?: number | null) {
  return euroFormatter.format(value ?? 0)
}

/** Formatage de date générique (dd/MM/yyyy), tolérant aux valeurs vides. */
function formatDate(value?: string) {
  if (!value) return '—'
  try {
    return format(new Date(value), 'dd/MM/yyyy')
  } catch {
    return value
  }
}

/**
 * Moyens de paiement : libellé fr-FR + sévérité de tag,
 * dérivés du champ `method` de paymentStepFields.
 */
const paymentMethodValues =
  paymentStepFields.find((f) => f.name === 'method')?.values ?? []
const methodLabelByValue = Object.fromEntries(
  paymentMethodValues.map((v) => [v.value, v.label['fr-FR']])
)
function methodLabel(value?: string) {
  if (!value) return '—'
  return methodLabelByValue[value] ?? value
}
const methodSeverity: Record<string, string> = {
  checkbook: 'info',
  cash: 'success',
  helloasso: 'warn',
  'holiday check': 'secondary',
  autre: 'contrast'
}

/**
 * Statut d'une étape de paiement :
 * - Encaissé : une date d'encaissement réelle existe
 * - En retard : encaissement prévu dans le passé, mais non encaissé
 * - Prévu : encaissement prévu dans le futur
 * - À planifier : ni date prévue ni encaissement
 */
function stepStatus(step: MsPaymentStep) {
  if (step.receipt_date)
    return { label: 'Encaissé', severity: 'success', icon: 'pi pi-check' }
  if (step.planned_receipt_date) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (new Date(step.planned_receipt_date) < today)
      return { label: 'En retard', severity: 'danger', icon: 'pi pi-exclamation-triangle' }
    return { label: 'Prévu', severity: 'warn', icon: 'pi pi-clock' }
  }
  return { label: 'À planifier', severity: 'secondary', icon: 'pi pi-question-circle' }
}

/**
 * Synthèse financière de l'adhésion courante :
 * dû (total_amount), encaissé, à venir (prévu non encaissé),
 * reste à payer et pourcentage encaissé pour la barre de progression.
 */
/** Coercition numérique : les montants peuvent arriver en chaîne depuis l'API,
 *  ce qui provoquerait une concaténation au lieu d'une somme. On garde les
 *  décimales (centimes), d'où Number() plutôt que parseInt. */
function toNumber(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const paymentSummary = computed(() => {
  const steps = currentPayment.value?.payment_step ?? []
  const due = toNumber(currentPayment.value?.total_amount)
  let received = 0
  let planned = 0
  for (const s of steps) {
    const amount = toNumber(s.amount)
    if (s.receipt_date) received += amount
    else planned += amount
  }
  const remaining = Math.round((due - received) * 100) / 100
  const progress = due > 0 ? Math.min(100, Math.round((received / due) * 100)) : 0
  return { due, received, planned, remaining, progress }
})

/**
 * Encaissement : écriture d'une date dans une étape de paiement.
 * Les dates sont stockées en ISO (2026-09-01T00:00:00.000Z) mais un input
 * `type=date` natif attend YYYY-MM-DD — on convertit en lecture (toDateInput)
 * et on réécrit la valeur brute du picker (ou null si vidée).
 */
function onStepDateInput(step: Record<string, any>, fieldName: string, value: unknown) {
  step[fieldName] = (value as string) || null
}

/**
 * Formulaire d'ajout d'un paiement, replié par défaut.
 * `addPaymentInitialData` permet de pré-remplir le formulaire (duplication) ;
 * `addFormKey` force un remontage du data-form pour repartir d'un état propre.
 */
const showAddPayment = ref(false)
const addPaymentInitialData = ref<Record<string, any>>({})
const addFormKey = ref(0)

function openAddPayment(initial: Record<string, any> = {}) {
  addPaymentInitialData.value = initial
  addFormKey.value++
  showAddPayment.value = true
}

/**
 * Duplique une étape de paiement : on reprend les saisies récurrentes
 * (moyen, montant, information) et on laisse les dates vides, puisqu'elles
 * changent à chaque échéance. L'utilisateur ajuste puis valide.
 */
function duplicatePaymentStep(step: MsPaymentStep) {
  openAddPayment({
    method: step.method,
    amount: step.amount,
    information: step.information
  })
}

async function onAddPaymentStep(paymentId: string, values: unknown) {
  const ok = await addPaymentStep(paymentId, values)
  if (ok) showAddPayment.value = false
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
  <confirm-dialog />
  <header class="bg-white border-b p-2 md:p-4">
    <h1 class="text-3xl leading-8 font-medium">État des paiements</h1>
  </header>

  <div class="flex gap-4 p-4 flex-1 w-full overflow-hidden">
    <aside
      class="w-[28rem] shrink-0 bg-white border border-surface rounded-lg p-2 overflow-hidden flex flex-col"
    >
      <!-- affichage des inscriptions avec moteur de recherche et tri ? -->
      <div class="flex flex-col gap-1">
        <label for="search" class="text-sm"> Recherche libre </label>
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
        <label for="search" class="text-sm"> Saison </label>
        <select v-model="filters.season" class="rounded border p-1 bg-white">
          <option selected :value="null">Sélectionner une saison</option>
          <option v-for="season in glossaries.seasons" :key="season.slug" :value="season.id">
            {{ season.name }}
          </option>
        </select>
      </div>
      <div class="flex gap-2">
        <div class="w-1/2 flex flex-col gap-1">
          <label for="search" class="text-sm"> État </label>
          <select v-model="filters.status" class="rounded border p-1 bg-white">
            <option selected :value="null">Sélectionner un état de paiement</option>
            <option v-for="status in glossaries.status" :key="status.slug" :value="status.id">
              {{ status.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="mt-1 leading-6 text-muted-color">{{ payments.total }} élèves</div>

      <prime-paginator :rows="payments.limit" :total-records="payments.total" @page="onPage" />

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

        <h2 class="text-2xl">Fiche de renseignements</h2>
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

        <h2 class="text-2xl my-2 flex items-center">Adhésion</h2>

        <section class="my-4">
          <div :key="currentPayment.id" class="border rounded-lg bg-white p-4 p-2 md:p-4 mb-2">
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
              <div class="flex flex-col gap-3">
                <article
                  v-for="registration in currentPayment.registration"
                  :key="registration.id"
                  class="border rounded-xl p-4 transition-colors"
                  :class="
                    registration.cancelled
                      ? 'bg-orange-50 border-orange-200'
                      : editingRegistrations[registration.id]
                        ? 'bg-primary-50/40 border-primary-300'
                        : 'bg-white hover:shadow-sm'
                  "
                >
                  <!-- Header : identity + actions -->
                  <header class="flex justify-between items-start gap-3 mb-3 flex-wrap">
                    <div>
                      <h4 class="text-xl font-semibold text-primary leading-tight">
                        {{ registration.membership_person?.firstname }}
                        {{ registration.membership_person?.lastname }}
                      </h4>
                      <p class="text-sm text-muted-color">
                        {{
                          glossaryState.courses[registration.activity_course_id]?.name ||
                          'Cours non renseigné'
                        }}
                        <template
                          v-if="
                            registration.activity_instrument_id &&
                            glossaryState.instruments[registration.activity_instrument_id]
                          "
                        >
                          · {{ glossaryState.instruments[registration.activity_instrument_id].name }}
                        </template>
                      </p>
                    </div>
                    <div class="flex gap-2 shrink-0">
                      <template v-if="!editingRegistrations[registration.id]">
                        <prime-button
                          size="small"
                          outlined
                          icon="pi pi-pencil"
                          label="Modifier"
                          @click="startEditRegistration(registration)"
                        />
                        <prime-button
                          size="small"
                          severity="danger"
                          outlined
                          icon="pi pi-trash"
                          aria-label="Supprimer l'inscription"
                          @click="onDeleteRegistration(registration)"
                        />
                      </template>
                      <template v-else>
                        <prime-button
                          size="small"
                          severity="secondary"
                          text
                          label="Annuler"
                          @click="cancelEditRegistration(registration)"
                        />
                        <prime-button
                          size="small"
                          icon="pi pi-check"
                          label="Enregistrer"
                          @click="saveEditRegistration(registration)"
                        />
                      </template>
                    </div>
                  </header>

                  <section
                    v-if="registration.cancelled"
                    class="font-semibold w-full text-center text-orange-700 my-2"
                  >
                    Annulée le {{ registration.cancelation_date }} pour motif
                    {{ registration.cancelation_reason }}
                  </section>

                  <!-- READ-ONLY MODE -->
                  <template v-if="!editingRegistrations[registration.id]">
                    <dl
                      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3 text-sm"
                    >
                      <div>
                        <dt class="text-muted-color">Date de naissance</dt>
                        <dd class="font-medium">
                          {{ formatBirthday(registration.membership_person?.birthday) }}
                        </dd>
                      </div>
                      <div>
                        <dt class="text-muted-color">Formation musicale</dt>
                        <dd class="font-medium">
                          {{ teachYearLabel(registration.activity_teach_year) }}
                        </dd>
                      </div>
                      <div>
                        <dt class="text-muted-color">Livret FM</dt>
                        <dd class="font-medium">
                          {{ registration.activity_want_music_book ? 'Oui' : 'Non' }}
                        </dd>
                      </div>
                      <div>
                        <dt class="text-muted-color">Prix selon QF</dt>
                        <dd class="font-medium">{{ registration.price ?? '—' }} €</dd>
                      </div>
                      <div>
                        <dt class="text-muted-color">Réduction</dt>
                        <dd class="font-medium">{{ registration.discount ?? 0 }} %</dd>
                      </div>
                      <div>
                        <dt class="text-muted-color">Prix final</dt>
                        <dd class="font-semibold text-primary">
                          {{ registration.final_price ?? '—' }} €
                        </dd>
                      </div>
                      <div class="col-span-2">
                        <dt class="text-muted-color">Ateliers</dt>
                        <dd class="font-medium">
                          <template
                            v-if="
                              registration.workshop_choice_1 ||
                              registration.workshop_choice_2 ||
                              registration.workshop_choice_3
                            "
                          >
                            <div v-if="registration.workshop_choice_1">
                              {{ workshopLabel(registration.workshop_choice_1) }}
                            </div>
                            <div v-if="registration.workshop_choice_2">
                              {{ workshopLabel(registration.workshop_choice_2) }}
                            </div>
                            <div v-if="registration.workshop_choice_3">
                              {{ workshopLabel(registration.workshop_choice_3) }}
                            </div>
                          </template>
                          <template v-else>—</template>
                        </dd>
                      </div>
                    </dl>
                    <div class="mt-3 text-sm">
                      <span class="text-muted-color">Informations</span>
                      <p class="whitespace-pre-line">{{ registration.information || '—' }}</p>
                    </div>
                  </template>

                  <!-- EDIT MODE -->
                  <template v-else>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <template v-if="registration.membership_person">
                        <div class="flex flex-col gap-1">
                          <label class="font-semibold text-sm">NOM</label>
                          <prime-input-text
                            v-model="registration.membership_person.lastname"
                            autocomplete="off"
                          />
                        </div>
                        <div class="flex flex-col gap-1">
                          <label class="font-semibold text-sm">Prénom</label>
                          <prime-input-text
                            v-model="registration.membership_person.firstname"
                            autocomplete="off"
                          />
                        </div>
                        <div class="flex flex-col gap-1">
                          <label class="font-semibold text-sm">Date de naissance</label>
                          <prime-input-text
                            type="date"
                            :model-value="toDateInput(registration.membership_person.birthday)"
                            @update:model-value="onBirthdayInput(registration, $event)"
                          />
                        </div>
                      </template>

                      <div class="flex flex-col gap-1">
                        <label class="font-semibold text-sm">Cours</label>
                        <prime-select
                          v-model="registration.activity_course_id"
                          :options="courseOptions"
                          option-label="name"
                          option-value="id"
                          filter
                          placeholder="Choisir un cours"
                        />
                      </div>
                      <div class="flex flex-col gap-1">
                        <label class="font-semibold text-sm">Instrument</label>
                        <prime-select
                          v-model="registration.activity_instrument_id"
                          :options="instrumentOptions"
                          option-label="name"
                          option-value="id"
                          filter
                          show-clear
                          placeholder="Choisir un instrument"
                        />
                      </div>
                      <div class="flex flex-col gap-1">
                        <label class="font-semibold text-sm">Formation musicale (année)</label>
                        <prime-select
                          v-model="registration.activity_teach_year"
                          :options="teachYearOptions"
                          option-label="label"
                          option-value="value"
                          show-clear
                          placeholder="Choisir une année"
                        />
                      </div>

                      <div class="flex flex-col gap-1">
                        <label class="font-semibold text-sm">Prix selon QF</label>
                        <prime-input-number
                          v-model="registration.price"
                          mode="currency"
                          currency="EUR"
                          locale="fr-FR"
                          @update:model-value="recomputeFinalPrice(registration)"
                        />
                      </div>
                      <div class="flex flex-col gap-1">
                        <label class="font-semibold text-sm">Réduction (%)</label>
                        <prime-input-number
                          v-model="registration.discount"
                          suffix=" %"
                          @update:model-value="recomputeFinalPrice(registration)"
                        />
                      </div>
                      <div class="flex flex-col gap-1">
                        <label class="font-semibold text-sm">Prix final (calculé)</label>
                        <prime-input-number
                          v-model="registration.final_price"
                          mode="currency"
                          currency="EUR"
                          locale="fr-FR"
                          disabled
                        />
                      </div>

                      <div class="flex flex-col gap-1 md:col-span-2 lg:col-span-1">
                        <label class="font-semibold text-sm">Ateliers</label>
                        <prime-select
                          v-model="registration.workshop_choice_1"
                          :options="workshopOptions"
                          option-label="label"
                          option-value="value"
                          filter
                          show-clear
                          placeholder="Choix 1"
                        />
                        <prime-select
                          v-model="registration.workshop_choice_2"
                          :options="workshopOptions"
                          option-label="label"
                          option-value="value"
                          filter
                          show-clear
                          placeholder="Choix 2"
                        />
                        <prime-select
                          v-model="registration.workshop_choice_3"
                          :options="workshopOptions"
                          option-label="label"
                          option-value="value"
                          filter
                          show-clear
                          placeholder="Choix 3"
                        />
                      </div>

                      <label class="flex items-center gap-2 self-end">
                        <input type="checkbox" v-model="registration.activity_want_music_book" />
                        <span>Souhaite le livret FM</span>
                      </label>

                      <div class="flex flex-col gap-1 md:col-span-2 lg:col-span-3">
                        <label class="font-semibold text-sm">Informations</label>
                        <textarea
                          class="w-full border rounded p-2 h-24"
                          v-model="registration.information"
                        ></textarea>
                      </div>
                    </div>

                    <!-- Tarifs de référence du cours -->
                    <div
                      v-if="glossaryState.courses[registration.activity_course_id]"
                      class="mt-3 pt-3 border-t text-xs text-muted-color flex flex-wrap gap-x-4 gap-y-1"
                    >
                      <span class="font-semibold">Tarifs du cours :</span>
                      <span>
                        T1 :
                        {{ glossaryState.courses[registration.activity_course_id].price_quotient1 }} €
                      </span>
                      <span>
                        T2 :
                        {{ glossaryState.courses[registration.activity_course_id].price_quotient2 }} €
                      </span>
                      <span>
                        T3 :
                        {{ glossaryState.courses[registration.activity_course_id].price_quotient3 }} €
                      </span>
                      <span>
                        T4 :
                        {{ glossaryState.courses[registration.activity_course_id].price_quotient4 }} €
                      </span>
                    </div>
                  </template>
                </article>
              </div>

              <h3 class="text-xl my-4">Paiements</h3>

              <!-- Synthèse financière -->
              <div class="rounded-lg border bg-slate-50 p-4 mb-4">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div class="text-sm text-muted-color">Dû</div>
                    <div class="text-xl font-semibold">
                      {{ formatEuro(paymentSummary.due) }}
                    </div>
                  </div>
                  <div>
                    <div class="text-sm text-muted-color">Encaissé</div>
                    <div class="text-xl font-semibold text-green-700">
                      {{ formatEuro(paymentSummary.received) }}
                    </div>
                  </div>
                  <div>
                    <div class="text-sm text-muted-color">À venir</div>
                    <div class="text-xl font-semibold text-amber-600">
                      {{ formatEuro(paymentSummary.planned) }}
                    </div>
                  </div>
                  <div>
                    <div class="text-sm text-muted-color">Reste à payer</div>
                    <div
                      class="text-xl font-semibold"
                      :class="paymentSummary.remaining <= 0 ? 'text-green-700' : 'text-red-600'"
                    >
                      {{ formatEuro(paymentSummary.remaining) }}
                    </div>
                  </div>
                </div>
                <div class="mt-4">
                  <div class="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      class="h-full bg-green-500 transition-all duration-300"
                      :style="{ width: paymentSummary.progress + '%' }"
                    ></div>
                  </div>
                  <div class="mt-1 text-sm text-muted-color">
                    {{ paymentSummary.progress }} % encaissé
                  </div>
                </div>
              </div>

              <prime-datatable
                :value="currentPayment.payment_step"
                v-model:editingRows="editingRows"
                @row-edit-save="onRowEditSave"
                editMode="row"
                dataKey="id"
                :pt="{
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
                  <template #body="{ data }">
                    <prime-tag
                      v-if="f.name === 'method'"
                      :value="methodLabel(data[f.name])"
                      :severity="methodSeverity[data[f.name]] ?? 'secondary'"
                    />
                    <template v-else-if="f.input === 'date'">
                      {{ formatDate(data[f.name]) }}
                    </template>
                    <span v-else-if="f.name === 'amount'" class="font-medium">
                      {{ formatEuro(data[f.name]) }}
                    </span>
                    <template v-else>{{ data[f.name] || '—' }}</template>
                  </template>

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
                      type="date"
                      :model-value="toDateInput(data[f.name])"
                      @update:model-value="onStepDateInput(data, f.name, $event)"
                    />

                    <select v-model="data[field]" v-else-if="f.input === 'single-data'">
                      <option v-for="choice in f.values" :key="choice.value" :value="choice.value">
                        {{ choice.label['fr-FR'] }}
                      </option>
                    </select>
                  </template>
                </prime-column>

                <prime-column header="État">
                  <template #body="{ data }">
                    <prime-tag
                      :value="stepStatus(data).label"
                      :severity="stepStatus(data).severity"
                      :icon="stepStatus(data).icon"
                    />
                  </template>
                </prime-column>

                <prime-column
                  :rowEditor="true"
                  style="width: 10%; min-width: 8rem"
                  bodyStyle="text-align:center"
                >
                </prime-column>

                <prime-column style="width: 3rem" bodyStyle="text-align:center">
                  <template #body="{ data }">
                    <prime-button
                      icon="pi pi-copy"
                      text
                      rounded
                      size="small"
                      severity="secondary"
                      aria-label="Dupliquer ce paiement"
                      title="Dupliquer ce paiement"
                      @click="duplicatePaymentStep(data)"
                    />
                  </template>
                </prime-column>

                <template #empty>
                  <div class="text-center text-muted-color py-4">
                    Aucun paiement enregistré pour l'instant.
                  </div>
                </template>
              </prime-datatable>

              <!-- Ajout d'un paiement (replié par défaut) -->
              <div class="mt-4">
                <prime-button
                  v-if="!showAddPayment"
                  icon="pi pi-plus"
                  label="Ajouter un paiement"
                  outlined
                  @click="openAddPayment()"
                />
                <div v-else class="border rounded-lg bg-slate-50 p-4">
                  <div class="flex items-center justify-between mb-3">
                    <h4 class="font-semibold">Nouveau paiement</h4>
                    <prime-button
                      icon="pi pi-times"
                      text
                      rounded
                      severity="secondary"
                      aria-label="Fermer"
                      @click="showAddPayment = false"
                    />
                  </div>
                  <data-form
                    :key="addFormKey"
                    :step="{ fields: paymentStepFields }"
                    :initial-data="addPaymentInitialData"
                    submit-button-label="Ajouter montant"
                    @submit="onAddPaymentStep(currentPayment.id, $event)"
                  />
                </div>
              </div>
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

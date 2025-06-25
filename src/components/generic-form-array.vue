<template>
  <!--
    The actual slot of the PrimeForm is the states property...
    TODO: fix it when PrimeVue will fix this bug
    => typing is false for the template
  -->
  <PrimeForm
    v-slot="states"
    :resolver
    @submit="onFormSubmit"
    :initialValues="localData"
    validate-on-blur
    :validateOnValueUpdate="false"
  >
    <slot name="top" />
    <slot>
      <div class="flex flex-col gap-1" v-if="array">
        <!--
          beware that a v-for with a range start from 1 and not 0
          we need to substract 1 each time we use idx for referencing array elements
          https://vuejs.org/guide/essentials/list.html#v-for-with-a-range
        -->
        <prime-card
          v-for="idx in nbRecords"
          class="my-2 border !shadow-none !rounded-md"
          :key="idx - 1"
        >
          <template #title>
            <div class="flex justify-between items-center border-b pb-2">
              <h3 class="text-xl font-medium">
                {{ recordTitle(states, idx - 1) }}
              </h3>
              <prime-button
                type="button"
                @click="removeRecord(idx - 1)"
                class="p-2 m-2 font-medium border"
                severity="danger"
                outlined
              >
                <span class="hidden md:flex font-normal"> {{ labels.removeRecord }} </span>
                <i class="pi pi-times" />
              </prime-button>
            </div>
          </template>
          <template #content>
            <template
              v-for="f in fieldsDisplayed(states).value.filter((f) =>
                f.id.startsWith(`form_${idx - 1}`)
              )"
              :key="f.id"
            >
              <div class="mb-4">
                <!-- boolean -->
                <div class="flex items-center" v-if="!f.hidden">
                  <PrimeToggleSwitch
                    v-if="f.component === FIELD_COMPONENT.TOGGLE_SWITCH"
                    :name="f.id"
                    class="mr-2"
                    :class="f.class"
                    fluid
                  />

                  <label :for="f.id">
                    {{ f.label }}
                    <span v-if="f.validationRules?.required" class="text-red-500">*</span>
                  </label>
                </div>

                <!-- Read only fields -->
                <PrimeInputText
                  v-if="f.readonly"
                  :name="f.id"
                  :class="f.class"
                  :id="f.id"
                  type="text"
                  :value="f.displayValue"
                  disabled
                  fluid
                />

                <PrimeInputText
                  v-else-if="f.hidden"
                  :name="f.id"
                  :class="f.class"
                  :id="f.id"
                  type="hidden"
                  fluid
                />

                <!-- text / email -->
                <PrimeInputText
                  v-else-if="f.component === FIELD_COMPONENT.INPUT_TEXT"
                  :name="f.id"
                  :class="f.class"
                  :id="f.id"
                  type="text"
                  fluid
                />
                <PrimeInputText
                  v-else-if="f.component === FIELD_COMPONENT.INPUT_EMAIL"
                  :name="f.id"
                  :id="f.id"
                  :class="f.class"
                  type="email"
                  fluid
                />

                <!-- password -->
                <PrimePassword
                  v-else-if="f.component === FIELD_COMPONENT.INPUT_PASSWORD"
                  :name="f.id"
                  :input-id="f.id"
                  :class="f.class"
                  :feedback="false"
                  toggleMask
                  fluid
                />

                <!-- number / float -->
                <PrimeInputNumber
                  v-else-if="f.component === FIELD_COMPONENT.INPUT_NUMBER"
                  :name="f.id"
                  :class="f.class"
                  :input-id="f.id"
                  fluid
                />

                <!-- date / datetime -->
                <PrimeInputText
                  v-else-if="
                    [FIELD_COMPONENT.INPUT_DATE, FIELD_COMPONENT.INPUT_DATETIME].includes(
                      f.component
                    )
                  "
                  :name="f.id"
                  :class="f.class"
                  :id="f.id"
                  :type="f.component === FIELD_COMPONENT.INPUT_DATE ? 'date' : 'datetime-local'"
                  :show-time="f.component === FIELD_COMPONENT.INPUT_DATETIME"
                  show-icon
                  icon-display="input"
                  append-to="body"
                  fluid
                />

                <!-- radio -->
                <PrimeRadioButtonGroup
                  :name="f.id"
                  :class="f.class"
                  :id="f.id"
                  v-else-if="f.component === FIELD_COMPONENT.INPUT_RADIO"
                >
                  <div
                    class="flex items-center gap-2"
                    v-for="option in f.source.options"
                    :key="option[f.source.value]"
                  >
                    <PrimeRadioButton
                      :inputId="option[f.source.value]"
                      :value="option[f.source.value]"
                    />
                    <label :for="option[f.source.value]">{{ option[f.source.label] }}</label>
                  </div>
                </PrimeRadioButtonGroup>

                <!-- single select -->
                <PrimeSelect
                  v-else-if="f.component === FIELD_COMPONENT.SINGLE_SELECT"
                  :name="f.id"
                  :class="f.class"
                  :label-id="f.id"
                  :options="f.source.options"
                  :show-clear="true"
                  :placeholder="t('locokit.components.primeDropdown.placeholder')"
                  class="mb-2 w-full"
                  fluid
                >
                  <template #value="slotProps">
                    <single-tag
                      v-if="slotProps.value"
                      :label="getSelectOptionLabel(slotProps.value, f)"
                      :color="getSelectOptionColors(slotProps.value, f)?.text"
                      :background-color="getSelectOptionColors(slotProps.value, f)?.background"
                    />
                    <span v-else>
                      {{ slotProps.placeholder }}
                    </span>
                  </template>
                  <template #option="slotProps">
                    <single-tag
                      :label="getSelectOptionLabel(slotProps.option, f)"
                      :color="getSelectOptionColors(slotProps.option, f)?.text"
                      :background-color="getSelectOptionColors(slotProps.option, f)?.background"
                    />
                  </template>
                </PrimeSelect>

                <!-- autocomplete -->
                <!-- <PrimeAutocomplete
      v-else-if="f.component === FIELD_COMPONENT.AUTOCOMPLETE"
      :name="f.id"
      :class="f.class"
      :input-id="f.id"
      :placeholder="t('locokit.components.primeAutocomplete.placeholder')"
      :suggestions="props.autocompleteSuggestions"
      :option-label="f.source.label"
      :force-selection="!(f.freeInput ?? true)"
      @complete="onComplete($event, f, states)"
      @value-change="(value) => onValueChange(value, f)"
      input-class="w-full border-r-0 hover:border-surface-500 "
      dropdown
      dropdown-mode="current"
      dropdown-class="bg-transparent hover:bg-transparent primary border-l-0 border-surface-300 text-surface-500 hover:border-surface-500 w-12"
      fluid
    /> -->

                <!-- textarea -->
                <PrimeTextarea
                  v-else-if="f.component === FIELD_COMPONENT.TEXTAREA"
                  :name="f.id"
                  :class="f.class"
                  :id="f.id"
                  :rows="f.rows ?? 6"
                  :cols="f.cols"
                  :fluid="!f.cols"
                />

                <template v-else-if="f.component === 'SPECIFIC_COMPONENT'">
                  <FormField
                    v-slot="$field"
                    :name="f.id"
                    :initialValue="f.initialValue"
                    class="flex flex-col gap-1"
                  >
                    <component
                      v-model="$field.value"
                      :id="f.id"
                      :is="f.specificComponent"
                      :class="f.class"
                      v-bind="f.attrs"
                    />
                    <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">
                      {{ $field.error?.message }}
                    </Message>
                  </FormField>
                </template>

                <PrimeMessage
                  v-else-if="f.component !== FIELD_COMPONENT.TOGGLE_SWITCH"
                  severity="error"
                >
                  Component {{ f.component }} is not yet implemented.
                </PrimeMessage>

                <template v-if="f.description">
                  <p class="text-slate-500" v-for="(line, index) in f.description" :key="index">
                    {{ line }}
                  </p>
                </template>

                <PrimeMessage
                  v-if="states?.[f.id]?.invalid"
                  severity="error"
                  size="small"
                  variant="simple"
                  :data-testid="'field-error-' + f.id"
                >
                  {{ states?.[f.id]?.error?.message }}
                </PrimeMessage>
              </div>
            </template>
          </template>
        </prime-card>

        <prime-button
          type="button"
          icon="bi bi-plus-circle"
          @click.stop="addRecord"
          class="p-2 m-2 mx-auto font-medium border"
          severity="info"
          :label="labels.addRecord"
        />
      </div>
      <div class="flex flex-col gap-1" v-else>
        <template v-for="f in fieldsDisplayed(states).value" :key="f.id">
          <div class="mb-4">
            <!-- boolean -->
            <div class="flex items-center" v-if="!f.hidden">
              <PrimeToggleSwitch
                v-if="f.component === FIELD_COMPONENT.TOGGLE_SWITCH"
                :name="f.id"
                class="mr-2"
                :class="f.class"
                fluid
              />

              <label :for="f.id">
                {{ f.label }}
                <span v-if="f.validationRules?.required" class="text-red-500">*</span>
              </label>
            </div>

            <!-- Read only fields -->
            <PrimeInputText
              v-if="f.readonly"
              :name="f.id"
              :class="f.class"
              :id="f.id"
              type="text"
              :value="f.displayValue"
              disabled
              fluid
            />

            <PrimeInputText
              v-else-if="f.hidden"
              :name="f.id"
              :class="f.class"
              :id="f.id"
              type="hidden"
              fluid
            />

            <!-- text / email -->
            <PrimeInputText
              v-else-if="f.component === FIELD_COMPONENT.INPUT_TEXT"
              :name="f.id"
              :class="f.class"
              :id="f.id"
              type="text"
              fluid
            />
            <PrimeInputText
              v-else-if="f.component === FIELD_COMPONENT.INPUT_EMAIL"
              :name="f.id"
              :id="f.id"
              :class="f.class"
              type="email"
              fluid
            />

            <!-- password -->
            <PrimePassword
              v-else-if="f.component === FIELD_COMPONENT.INPUT_PASSWORD"
              :name="f.id"
              :input-id="f.id"
              :class="f.class"
              :feedback="false"
              toggleMask
              fluid
            />

            <!-- number / float -->
            <PrimeInputNumber
              v-else-if="f.component === FIELD_COMPONENT.INPUT_NUMBER"
              :name="f.id"
              :class="f.class"
              :input-id="f.id"
              fluid
            />

            <!-- date / datetime -->
            <PrimeInputText
              v-else-if="
                [FIELD_COMPONENT.INPUT_DATE, FIELD_COMPONENT.INPUT_DATETIME].includes(f.component)
              "
              :name="f.id"
              :class="f.class"
              :id="f.id"
              :type="f.component === FIELD_COMPONENT.INPUT_DATE ? 'date' : 'datetime-local'"
              :show-time="f.component === FIELD_COMPONENT.INPUT_DATETIME"
              show-icon
              icon-display="input"
              append-to="body"
              fluid
            />

            <!-- radio -->
            <PrimeRadioButtonGroup
              :name="f.id"
              :class="f.class"
              :id="f.id"
              v-else-if="f.component === FIELD_COMPONENT.INPUT_RADIO"
            >
              <div
                class="flex items-center gap-2"
                v-for="option in f.source.options"
                :key="option[f.source.value]"
              >
                <PrimeRadioButton
                  :inputId="option[f.source.value]"
                  :value="option[f.source.value]"
                />
                <label :for="option[f.source.value]">{{ option[f.source.label] }}</label>
              </div>
            </PrimeRadioButtonGroup>

            <!-- single select -->
            <PrimeSelect
              v-else-if="f.component === FIELD_COMPONENT.SINGLE_SELECT"
              :name="f.id"
              :class="f.class"
              :label-id="f.id"
              :options="f.source.options"
              :show-clear="true"
              :placeholder="t('locokit.components.primeDropdown.placeholder')"
              class="mb-2 w-full"
              fluid
            >
              <template #value="slotProps">
                <single-tag
                  v-if="slotProps.value"
                  :label="getSelectOptionLabel(slotProps.value, f)"
                  :color="getSelectOptionColors(slotProps.value, f)?.text"
                  :background-color="getSelectOptionColors(slotProps.value, f)?.background"
                />
                <span v-else>
                  {{ slotProps.placeholder }}
                </span>
              </template>
              <template #option="slotProps">
                <single-tag
                  :label="getSelectOptionLabel(slotProps.option, f)"
                  :color="getSelectOptionColors(slotProps.option, f)?.text"
                  :background-color="getSelectOptionColors(slotProps.option, f)?.background"
                />
              </template>
            </PrimeSelect>

            <!-- autocomplete -->
            <!-- <PrimeAutocomplete
      v-else-if="f.component === FIELD_COMPONENT.AUTOCOMPLETE"
      :name="f.id"
      :class="f.class"
      :input-id="f.id"
      :placeholder="t('locokit.components.primeAutocomplete.placeholder')"
      :suggestions="props.autocompleteSuggestions"
      :option-label="f.source.label"
      :force-selection="!(f.freeInput ?? true)"
      @complete="onComplete($event, f, states)"
      @value-change="(value) => onValueChange(value, f)"
      input-class="w-full border-r-0 hover:border-surface-500 "
      dropdown
      dropdown-mode="current"
      dropdown-class="bg-transparent hover:bg-transparent primary border-l-0 border-surface-300 text-surface-500 hover:border-surface-500 w-12"
      fluid
    /> -->

            <!-- textarea -->
            <PrimeTextarea
              v-else-if="f.component === FIELD_COMPONENT.TEXTAREA"
              :name="f.id"
              :class="f.class"
              :id="f.id"
              :rows="f.rows ?? 6"
              :cols="f.cols"
              :fluid="!f.cols"
            />

            <template v-else-if="f.component === 'SPECIFIC_COMPONENT'">
              <FormField
                v-slot="$field"
                :name="f.id"
                :initialValue="f.initialValue"
                class="flex flex-col gap-1"
              >
                <component
                  v-model="$field.value"
                  :id="f.id"
                  :is="f.specificComponent"
                  :class="f.class"
                  v-bind="f.attrs"
                />
                <Message v-if="$field?.invalid" severity="error" size="small" variant="simple">
                  {{ $field.error?.message }}
                </Message>
              </FormField>
            </template>

            <PrimeMessage
              v-else-if="f.component !== FIELD_COMPONENT.TOGGLE_SWITCH"
              severity="error"
            >
              Component {{ f.component }} is not yet implemented.
            </PrimeMessage>

            <template v-if="f.description">
              <p class="text-slate-500" v-for="(line, index) in f.description" :key="index">
                {{ line }}
              </p>
            </template>

            <PrimeMessage
              v-if="states?.[f.id]?.invalid"
              severity="error"
              size="small"
              variant="simple"
              :data-testid="'field-error-' + f.id"
            >
              {{ states?.[f.id]?.error?.message }}
            </PrimeMessage>
          </div>
        </template>
      </div>
    </slot>

    <slot name="bottom" />

    <PrimeMessage
      v-if="message"
      :severity="message.status"
      class="my-2"
      data-testid="form-generic-message"
    >
      {{ message.text }}
    </PrimeMessage>

    <slot name="buttons">
      <div
        class="flex items-center justify-center gap-2 drop-shadow-lg"
        :class="{
          'sticky bottom-0': props.buttonPosition === 'sticky'
        }"
      >
        <PrimeButton
          v-if="buttons.submit"
          type="submit"
          severity="primary"
          :disabled="loading"
          :label="buttonLabels.submit"
          :icon="loading ? 'pi pi-spin pi-spinner' : ''"
        />
        <PrimeButton v-if="buttons.cancel" severity="secondary" :label="buttonLabels.cancel" />
        <PrimeButton v-if="buttons.reset" type="reset" :label="buttonLabels.reset" />
      </div>
    </slot>
  </PrimeForm>
</template>

<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// correlated to PrimeVue forms "states" / v-slot
import { computed, onMounted, ref, toValue, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  FormFieldState,
  FormResolverOptions,
  FormSubmitEvent,
  Form as PrimeForm
} from '@primevue/forms'
import { AutoCompleteCompleteEvent } from 'primevue/autocomplete'
import PrimeButton from 'primevue/button'
import PrimeMessage from 'primevue/message'
import {
  FIELD_COMPONENT,
  FIELD_TYPE,
  type LocoKitFormField,
  type LocoKitFormFieldAutocomplete,
  type LocoKitFormFieldSingleSelect,
  type LocoKitMessage
} from '@locokit/definitions'
import { format } from 'date-fns'
import { FormField } from '@primevue/forms'

// import PrimeAutocomplete from 'primevue/autocomplete'
import PrimeInputNumber from 'primevue/inputnumber'
import PrimeInputText from 'primevue/inputtext'
import PrimePassword from 'primevue/password'
import PrimeSelect from 'primevue/select'
import PrimeRadioButton from 'primevue/radiobutton'
import PrimeRadioButtonGroup from 'primevue/radiobuttongroup'
import PrimeTextarea from 'primevue/textarea'
import PrimeToggleSwitch from 'primevue/toggleswitch'
import { SingleTag } from '@locokit/vue-components'
import PrimeCard from 'primevue/card'

const { t } = useI18n()

const emit = defineEmits<{
  submit: [values: Record<string, any>]
  complete: [
    event: AutoCompleteCompleteEvent,
    field: LocoKitFormFieldAutocomplete,
    values: Record<string, unknown>
  ]
  'update:modelValue': [values: Record<string, any>]
}>()

const props = withDefaults(
  defineProps<{
    fields: LocoKitFormField[]
    initialValues?: FormValues | FormValues[]
    loading?: boolean
    buttons?: {
      submit: boolean
      reset: boolean
      cancel: boolean
    }
    labels?: {
      submit?: string
      reset?: string
      cancel?: string
      addRecord?: string
      removeRecord?: string
    }
    /** How to display submit buttons, default to sticky */
    buttonPosition?: 'sticky' | 'block'
    /** A message to display into the form, just above the buttons. */
    message?: LocoKitMessage | null
    /**
     * Suggestions used for autocomplete fields.
     * Only one prop is used,
     * and passed to all autocomplete fields,
     * as only one can be edited at a time.
     */
    autocompleteSuggestions?: unknown[]
    /**
     * Related records for filtering purpose
     */
    relatedRecords?: Record<string, LocoKitTableRecordEnhanced>
    /**
     * Array management
     */
    array?: boolean
    /**
     * Property in which to inject when submitting form, if needed.
     */
    property?: string
    recordTitle?: (record: FormValues, idx: number) => string
  }>(),
  {
    fields: () => [],
    initialValues: (props) => {
      if (props.array) return []
      else return {}
    },
    array: false,
    loading: false,
    buttons: () => ({
      submit: true,
      reset: false,
      cancel: true
    }),
    buttonPosition: 'sticky',
    labels: () => ({}),
    autocompleteSuggestions: () => [],
    relatedRecords: () => {}
  }
)

const autocompleteSelectedOptions = ref<Record<string, unknown>>({})

const buttonLabels = computed(() => {
  return {
    submit: props.labels.submit ?? t('locokit.components.formGeneric.submit'),
    reset: props.labels.reset ?? t('locokit.components.formGeneric.reset'),
    cancel: props.labels.cancel ?? t('locokit.components.formGeneric.cancel')
  }
})

/**
 * Fields to be displayed in the form,
 * according some conditional displayed rules
 *
 * Compute also the fact the field is required
 */
function getFieldDescription(f: LocoKitFormField) {
  if (!f.description) return null
  return Array.isArray(f.description) ? f.description : [f.description]
}
const fieldsById = computed<Record<string, LocoKitFormField>>(() => {
  const result = {}
  props.fields.forEach((f) => (result[f.id] = f))
  return result
})

function getFieldId(field: LocoKitFormField, idx: number) {
  if (!props.array) return field.id
  return `form_${idx}_${field.id}`
}

function getFieldsDisplayed(state, fromResolver: boolean = false, idx?: number) {
  const result = []
  props.fields.forEach((f) => {
    const fieldId = getFieldId(f, idx)
    // console.group(fieldId)

    let isDisplayed =
      f.settings?.default?.display?.visible !== undefined
        ? f.settings?.default.display.visible
        : true

    let isRequired =
      f.settings?.default?.validation?.required !== undefined
        ? f.settings?.default.validation?.required
        : false

    let hasMatch = f.settings?.default.validation?.match

    /**
     * For each display rule,
     * compute impacts if rule is enabled
     */
    f.settings?.rules?.forEach((r) => {
      // console.log('rule', r, state)
      let ruleEnabled = undefined
      r.conditions.forEach((currentCondition) => {
        const foreignField = fieldsById.value[currentCondition.fieldId] as LocoKitFormField
        const foreignFieldId = getFieldId(foreignField, idx)
        let foreignFieldValue = fromResolver
          ? state[foreignFieldId]?.[foreignField.source.value]
          : state[foreignFieldId]?.value
        switch (foreignField.component) {
          case FIELD_COMPONENT.SINGLE_SELECT:
          case FIELD_COMPONENT.AUTOCOMPLETE:
            if (!fromResolver) foreignFieldValue = foreignFieldValue?.[foreignField.source.value]
            break
        }
        let currentConditionEnabled = undefined
        // console.log(fieldId, 'condition', currentCondition, foreignFieldValue)
        // if (!foreignFieldValue) return
        switch (currentCondition.operator) {
          case '$eq':
            currentConditionEnabled = foreignFieldValue === currentCondition.value
            break
          case '$neq':
            currentConditionEnabled = foreignFieldValue !== currentCondition.value
            break
          case '$in':
            currentConditionEnabled = (currentCondition.value as unknown[]).includes(
              foreignFieldValue
            )
            break
          case '$nin':
            currentConditionEnabled = !(currentCondition.value as unknown[]).includes(
              foreignFieldValue
            )
            break
          default:
            console.warn(
              'Operator for conditional display not yet implemented: ' + currentRule.operator
            )
        }
        if (ruleEnabled === undefined) {
          ruleEnabled = currentConditionEnabled
        } else {
          ruleEnabled = ruleEnabled && currentConditionEnabled
        }
      })
      // console.log('rule', r, ruleEnabled)
      if (ruleEnabled) {
        if (r.impact?.display?.visible !== undefined) {
          isDisplayed = r.impact.display.visible
        }
        if (r.impact?.validation?.required !== undefined) {
          isRequired = isRequired || r.impact?.validation?.required
        }
      }
    })
    // console.log(fieldId, 'displayed ?', isDisplayed, 'required ?', isRequired)
    if (isDisplayed) {
      const newField = {
        ...f,
        id: fieldId,
        description: getFieldDescription(f)
      }
      if (f.readonly) {
        newField.displayValue =
          f.displayValue?.(
            state[fieldId]?.value || props.initialValues?.[idx]?.[f.id],
            props.initialValues,
            props.relatedRecords
          ) ||
          state[fieldId]?.value ||
          props.initialValues?.[idx]?.[f.id]
      }
      if (isRequired !== undefined) {
        newField.validationRules = {
          ...newField.validationRules,
          required: isRequired
        }
      }
      if (hasMatch) {
        newField.validationRules.match = hasMatch
      }
      /**
       * Compute attrs if it is a function
       * (TO BE TESTED)
       */
      // if (typeof f.attrs === 'function') {
      //   newField.attrs = f.attrs($field, values, props.relatedRecords)
      // } else {
      //   newField.attrs = f.attrs
      // }
      result.push(newField)
      // console.log('added')
    }
    // console.groupEnd()
  })
  return result
}

/**
 * Compute the fields to display,
 * regarding the number of records to display
 */
const fieldsDisplayed = (state: Record<string, FormFieldState>, fromResolver: boolean = false) => {
  return computed(() => {
    const result: LocoKitFormField[] = []
    // console.group('fieldsDisplayed recomputed fromResolver', fromResolver, state, localData)
    // console.log('fieldsDisplayed', state, props.fields, localData.value)

    if (props.array) {
      for (let idx = 0; idx < nbRecords.value; idx++) {
        result.push(...getFieldsDisplayed(state, fromResolver, idx))
      }
    } else {
      result.push(...getFieldsDisplayed(state, fromResolver))
    }
    // console.groupEnd()

    return result
  })
}

onMounted(() => {
  // Initialize autocompleteSelectedOptions variable with initial values
  // of autocomplete fields.
  for (const key in props.initialValues) {
    // Find the field definition matching the current initial value.
    const field = props.fields.find((item) => item.id === key)
    // Skip if the value does not concern any field.
    if (!field) {
      continue
    }

    if (field.component === FIELD_COMPONENT.AUTOCOMPLETE) {
      const value = props.initialValues[key]
      if (typeof value === 'object') {
        autocompleteSelectedOptions.value[field.id] = toValue(value)
      }
    }
  }
})

function getSelectOptionValue(option: unknown, field: LocoKitFormFieldSingleSelect) {
  if (!option) return null
  if (typeof option === 'object' && field.source.value) {
    return option[field.source.value]
  }

  return option
}

/**
 * Resolver to say if the form is OK regarding validation rules
 * (required + match)
 */
const resolver = ({ values }: FormResolverOptions) => {
  // console.log(values)
  // console.log(extractValuesFromStates(values))
  // emit('update:modelValue', extractValuesFromStates(values))
  const errors: Record<string, { message: string }[]> = {}

  // console.group('resolver')

  const fieldsDisplayedInForm = fieldsDisplayed(values, true).value
  // console.log(fieldsDisplayedInForm)

  fieldsDisplayedInForm.forEach((f) => {
    // console.log('resolving field', f, values[f.id], f.validationRules?.required)
    errors[f.id] = []
    if (f.validationRules?.required) {
      /**
       * Add an error according to the field type
       */
      switch (f.type) {
        case FIELD_TYPE.BOOLEAN:
          if (values[f.id] === undefined || values[f.id] === null)
            errors[f.id].push({
              message: t('locokit.validations.messages.required', { field: f.label })
            })
          break
        default:
          if (!values[f.id]) {
            errors[f.id].push({
              message: t('locokit.validations.messages.required', { field: f.label })
            })
          }
      }
    }
    if (f.validationRules?.match) {
      /**
       * Add an error according to the field type
       */
      switch (f.type) {
        case FIELD_TYPE.BOOLEAN:
          if (values[f.id] !== f.validationRules?.match)
            errors[f.id].push({
              message: `Le champ ${f.label} doit avoir une valeur correcte.`
            })
          break
        default:
          if (values[f.id] !== f.validationRules?.match)
            errors[f.id].push({
              message: `Le champ ${f.label} doit avoir une valeur correcte.`
            })
      }
    }
  })
  console.log('feedback resolver', errors)
  // console.groupEnd('resolver')
  return {
    errors
  }
}

/**
 * We extract all values from states,
 * by recombining them and rebuilding arrays if needed.
 * Beware, states can contains old array values even if fields are not displayed
 */
function extractValuesFromStates(states: Record<string, unknown>) {
  let values
  if (props.array) {
    values = []
    for (let i = 0; i < nbRecords.value; i++) {
      values.push({})
    }
  } else {
    values = {}
  }

  const fieldsDisplayedInForm = fieldsDisplayed(states).value

  console.log(fieldsDisplayedInForm)

  fieldsDisplayedInForm.forEach((field) => {
    // console.log(field.id, states[field.id])
    // Ignore states which are not objects or do not have a "value" property.
    if (typeof states[field.id] !== 'object' || !('value' in states[field.id])) {
      return
    }
    // No need to continue if the state does not concern one of our fields.
    // or if the found field is a readonly one
    if (!field || field.readonly) {
      return
    }

    let currentValue = states[field.id].value

    switch (field.component) {
      // Special handling of autocomplete fields whose suggestions can be objects
      // and not just strings.
      // case FIELD_COMPONENT.AUTOCOMPLETE:
      //   if (field.id in autocompleteSelectedOptions.value) {
      //     const option = autocompleteSelectedOptions.value[field.id]
      //     if (!option) continue
      //     const valueProp = (field as LocoKitFormFieldAutocomplete).source.value
      //     values[field.id] = valueProp ? option[valueProp] : option
      //   }
      //   break

      // Special handling of single select fields whose suggestions can be objects
      // and not just strings or numbers.
      case FIELD_COMPONENT.SINGLE_SELECT:
        currentValue = getSelectOptionValue(states[field.id].value, field)
        break

      // Special handling for datetime, need to be returned in the format YYYY-MM-ddTHH:mm:ss
      case FIELD_COMPONENT.INPUT_DATETIME:
        // eslint-disable-next-line no-case-declarations
        const datetimeValue = states[field.id].value as string
        if (datetimeValue?.length === 16) {
          currentValue = format(new Date(datetimeValue), "yyyy-MM-dd'T'hh:mm:ss")
        }
        break
    }

    if (props.array) {
      const idx = parseInt(field.id.substring('form_'.length, 'form_'.length + 1))
      const id = field.id.substring('form_x_'.length)
      values[idx][id] = currentValue
    } else {
      values[field.id] = currentValue
    }
  })
  // console.log(values, props.property)
  if (props.property && props.array) {
    return {
      [props.property]: values
    }
  } else return values
}

function getSelectOptionLabel(option: unknown, field: LocoKitFormFieldSingleSelect) {
  if (typeof option === 'object' && field.source.label) {
    return option[field.source.label]
  }

  return option
}

function getSelectOptionColors(option: unknown, field: LocoKitFormFieldSingleSelect) {
  if (typeof option === 'object' && field.source.colorFields) {
    const colorFields = field.source.colorFields
    return {
      text: colorFields.text ? option[colorFields.text] : null,
      background: colorFields.background ? option[colorFields.background] : null
    }
  }

  return null
}
const localData = ref()
const nbRecords = ref(0)
function removeRecord(idx: number) {
  if (!props.array) return
  nbRecords.value--
}
function addRecord() {
  if (!props.array) return
  nbRecords.value++
}

function onFormSubmit({ valid, states }: FormSubmitEvent) {
  if (valid) {
    const values = extractValuesFromStates(states)
    emit('submit', values)
  }
}

watch(
  () => [props.array, props.fields],
  () => {
    if (props.array) {
      const flattenInitivalValues = {}
      nbRecords.value = props.initialValues.length
      props.initialValues.forEach((iv, idx) => {
        for (const property in iv) {
          flattenInitivalValues[`form_${idx}_${property}`] = iv[property]
          /**
           * Rebuild complex values as SINGLE_SELECT
           */
          const currentField = props.fields.find((f) => f.id === property)
          if (currentField?.component === FIELD_COMPONENT.SINGLE_SELECT) {
            const matchingOption = currentField.source.options.find(
              (o) => o[currentField.source.value] === iv[property]
            )
            if (matchingOption) flattenInitivalValues[`form_${idx}_${property}`] = matchingOption
          }
        }
      })
      localData.value = { ...flattenInitivalValues }
    } else {
      localData.value = {
        ...(props.initialValues || {})
      }
      /**
       * Rebuild complex values as SINGLE_SELECT
       */
    }
  },
  {
    immediate: true
  }
)
</script>

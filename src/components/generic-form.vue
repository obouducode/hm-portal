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
    :validate-on-value-update="true"
  >
    <slot name="top" />
    <slot>
      <div class="flex flex-col gap-1" v-if="array">
        <prime-card
          v-for="(currentRecord, idx) in localData"
          class="my-2 border !shadow-none !rounded-md"
          :key="idx"
        >
          <template #title>
            <div class="flex justify-between items-center border-b pb-2">
              <h3 class="text-xl font-medium">
                Élève / cours {{ idx + 1 }} :
                {{ currentRecord.activity_lastname }}
                {{ currentRecord.activity_firstname }}
                {{ recordTitle(currentRecord, idx) }}
              </h3>
              <prime-button
                type="button"
                @click="removeRecord(idx)"
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
            <template v-for="f in fieldsDisplayed(states, idx).value" :key="f.id">
              <generic-form-field :f />
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
import { computed, onMounted, ref, toValue, type ComputedRef } from 'vue'
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
import PrimeTextarea from 'primevue/textarea'
import PrimeToggleSwitch from 'primevue/toggleswitch'
import { SingleTag } from '@locokit/vue-components'

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
    recordTitle?: (record: FormValues, idx: number) => ComputedRef
  }>(),
  {
    fields: () => [],
    initialValues: () => ({}),
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

const fieldsDisplayed = (state: Record<string, FormFieldState>) => {
  return computed(() => {
    const result: LocoKitFormField[] = []
    const values = state
    console.group('fieldsDisplayed recomputed')
    console.log('fieldsDisplayed', state, values, props.fields)

    props.fields.forEach((f) => {
      console.group(f.id)

      let isDisplayed =
        f.settings?.default?.display?.visible !== undefined
          ? f.settings?.default.display.visible
          : true

      let isRequired =
        f.settings?.default?.validation?.required !== undefined
          ? f.settings?.default.validation?.required
          : false

      /**
       * For each display rule,
       * compute impacts if rule is enabled
       */
      f.settings?.rules?.forEach((r) => {
        console.log('rule', r, state)
        let ruleEnabled = undefined
        r.conditions.forEach((currentCondition) => {
          let foreignFieldValue = values[currentCondition.fieldId]?.value
          const foreignField = fieldsById.value[currentCondition.fieldId] as LocoKitFormField
          switch (foreignField.component) {
            case FIELD_COMPONENT.SINGLE_SELECT:
            case FIELD_COMPONENT.AUTOCOMPLETE:
              foreignFieldValue = foreignFieldValue?.[foreignField.source.value]
              break
          }
          let currentConditionEnabled = undefined
          console.log('condition', currentCondition, foreignFieldValue)
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
        console.log('rule', r, ruleEnabled)
        if (ruleEnabled) {
          if (r.impact?.display?.visible !== undefined) {
            isDisplayed = r.impact.display.visible
          }
          if (r.impact?.validation?.required !== undefined) {
            isRequired = isRequired || r.impact?.validation?.required
          }
        }
      })
      console.log(f.id, 'displayed ?', isDisplayed, 'required ?', isRequired)
      if (isDisplayed) {
        const newField = {
          ...f,
          description: getFieldDescription(f)
        }
        if (f.readonly) {
          newField.displayValue =
            f.displayValue?.(
              values[f.id]?.value || props.initialValues[f.id],
              props.initialValues,
              props.relatedRecords
            ) ||
            values[f.id]?.value ||
            props.initialValues[f.id]
        }
        if (isRequired !== undefined) {
          newField.validationRules = {
            ...newField.validationRules,
            required: isRequired
          }
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
      console.groupEnd()
    })
    console.groupEnd('fieldsDisplayed recomputed')

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
 * (required only actually)
 */
const resolver = ({ values }: FormResolverOptions) => {
  console.log(values)
  console.log(extractValuesFromStates(values))
  emit('update:modelValue', extractValuesFromStates(values))
  const errors: Record<string, { message: string }[]> = {}

  console.group('resolver')

  fieldsDisplayed(values).value.forEach((f) => {
    console.log('resolving field', f, values[f.id], f.validationRules?.required)
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
  })
  console.error(errors)
  console.groupEnd('resolver')
  return {
    errors
  }
}

function extractValuesFromStates(states: Record<string, unknown>) {
  const values = {}

  for (const key in states) {
    // Ignore states which are not objects or do not have a "value" property.
    if (typeof states[key] !== 'object' || !('value' in states[key])) {
      continue
    }

    // Find the field definition matching the current state.
    const field = props.fields.find((item) => item.id === key)
    // No need to continue if the state does not concern one of our fields.
    // or if the found field is a readonly one
    if (!field || field.readonly) {
      continue
    }
    values[field.id] = states[field.id].value

    switch (field.component) {
      // Special handling of autocomplete fields whose suggestions can be objects
      // and not just strings.
      case FIELD_COMPONENT.AUTOCOMPLETE:
        if (field.id in autocompleteSelectedOptions.value) {
          const option = autocompleteSelectedOptions.value[field.id]
          if (!option) continue
          const valueProp = (field as LocoKitFormFieldAutocomplete).source.value
          values[field.id] = valueProp ? option[valueProp] : option
        }
        break

      // Special handling of single select fields whose suggestions can be objects
      // and not just strings or numbers.
      case FIELD_COMPONENT.SINGLE_SELECT:
        values[field.id] = getSelectOptionValue(states[field.id].value, field)
        break

      // Special handling for datetime, need to be returned in the format YYYY-MM-ddTHH:mm:ss
      case FIELD_COMPONENT.INPUT_DATETIME:
        const datetimeValue = states[field.id].value as string
        if (datetimeValue?.length === 16) {
          values[field.id] = format(new Date(datetimeValue), "yyyy-MM-dd'T'hh:mm:ss")
        }
        break
    }
  }

  return values
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
// function onValueChange(value: unknown, field: LocoKitFormFieldAutocomplete) {
//   // If the value is an object, this means it matches a suggestion
//   // which is represented by an object.
//   if (value && typeof value === 'object') {
//     autocompleteSelectedOptions.value[field.id] = toValue(value)
//   } else if (field.id in autocompleteSelectedOptions.value) {
//     delete autocompleteSelectedOptions.value[field.id]
//   }
// }

// function onComplete(
//   event: AutoCompleteCompleteEvent,
//   field: LocoKitFormFieldAutocomplete,
//   formState: Record<string, unknown>
// ) {
//   const values = extractValuesFromStates(formState)
//   emit('complete', field, event, values)
// }

/**
 * Array management
 */
const localData = ref(
  props.array ? props.initialValues?.map((i) => i) || [] : props.initialValues || {}
)
// function removeRecord(idx: number) {
//   if (!props.array) return
//   localData.value.splice(idx, 1)
// }
// function addRecord() {
//   if (!props.array) return
//   localData.value.push({})
// }

function onFormSubmit({ valid, states }: FormSubmitEvent) {
  console.log(valid, states)
  if (valid) {
    const values = extractValuesFromStates(states)
    emit('submit', values)
  }
}
</script>

<script setup lang="ts">
import { ref, defineEmits, watch, computed } from 'vue'
import PrimeInputText from 'primevue/inputtext'
import PrimeButton from 'primevue/button'
import PrimeCalendar from 'primevue/calendar'
import PrimeToggleSwitch from 'primevue/inputswitch'
import { type FormRecordStep } from '@/declarations'
import { Form as VvForm, Field as VvField, ErrorMessage as VvErrorMessage } from 'vee-validate'
import * as yup from 'yup'

const emits = defineEmits(['submit'])

const props = withDefaults(defineProps<{
  step: FormRecordStep,
  displaySubmitButton: boolean,
}>(), {
  displaySubmitButton: true
})

const schema = computed(() => {
  console.log(props.step.fields)
  const yupResult: Record<string, any> = {}
  if (!props.step.fields) return yup.object(yupResult)
  props.step.fields.forEach(f => {
    let currentField
    switch (f.input) {
      case 'boolean':
        currentField = yup.boolean()
        break
      case 'number':
      case 'float':
        currentField = yup.number()
        break
      case 'oneline-text':
        currentField = yup.string()
        if (f.type === 'email')
          currentField.email()
        break
      case 'date':
      case 'datetime':
        currentField = yup.date()
        break
      case 'single-data':
      case 'multi-data':
      case 'single-related-data':
      case 'multi-related-data':
      case 'multiline-text':
      default:
        currentField = yup.string()
    }
    if (f.rules?.required) currentField.required()
    yupResult[f.name] = currentField
  })
  console.log(yupResult)
  return yup.object(yupResult)
})

const dataForm = ref<Record<string, any>>({})

async function onSubmit(values: Record<string, any>) {
  console.log('submit', values, schema, schema.value.isValidSync(values))
  const result = await schema.value.isValid(values)
  console.log(result)
  emits('submit', dataForm)
}

watch(
  () => props.step,
  (newValue) => {
    console.log('step has changed', newValue)
  }, {
    deep: true,
    immediate: true,
  }
)
</script>

<template>
  <vv-form
    class="flex flex-col"
    @submit="onSubmit"
    :validation-schema="schema"
  >
    <template
      v-for="field in props.step.fields"
      :key="field.name"
    >
      <label :for="field.name" class="font-bold mt-2 mb-1">
        {{ field.label['fr-FR'] }}
        <span v-if="field.rules?.required" class="text-red-500">*</span>
      </label>
      <p
        class="text-gray-500 italic mb-1"
        v-if="field.description"
      >
        {{ field.description['fr-FR'] }}
      </p>
      <vv-field :name="field.name">
        <prime-input-text
          v-if="field.input === 'oneline-text'"
          :id="field.name"
          v-model="dataForm[field.name]"
          :class="field.class"
          :type="field.type || 'text'"
        />
        <textarea
          v-else-if="field.input === 'multiline-text'"
          :id="field.name"
          v-model="dataForm[field.name]"
          class="border rounded"
          :class="field.class"
          rows="5"
        />
        <template v-else-if="field.input === 'single-data'">
          <div
            v-for="choice in field.values"
            :key="choice.value"
            class="mb-2"
          >
            <input
              type="radio"
              :value="choice.value"
              v-model="dataForm[field.name]"
              :name="field.name"
              :id="choice.value"
              class="mr-2"
            >
            <label :for="choice.value">
              {{ choice.label['fr-FR'] }}
            </label>
          </div>
        </template>
        <template v-else-if="field.input === 'date'">
          <prime-calendar
            class="mb-2"
            v-model="dataForm[field.name]"
            :name="field.name"
            :id="field.name"
          />
        </template>
        <template v-else-if="field.input === 'boolean'">
          <prime-toggle-switch
            class="mb-2"
            v-model="dataForm[field.name]"
            :name="field.name"
            :id="field.name"
          />
        </template>
      </vv-field>
      <vv-error-message
        :name="field.name"
        class="text-red-500"
      />
    </template>
    <prime-button
      v-if="displaySubmitButton"
      type="submit"
      class="border p-2 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 font-bold w-64 mx-auto my-8"
    >
      Passer à l'étape suivante
    </prime-button>
  </vv-form>
</template>

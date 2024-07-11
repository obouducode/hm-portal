<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import PrimeInputText from 'primevue/inputtext'
import PrimeButton from 'primevue/button'
import PrimeToggleSwitch from 'primevue/inputswitch'
import { type FormRecordStep } from '@/declarations'
import { Form as VvForm, Field as VvField, ErrorMessage as VvErrorMessage } from 'vee-validate'
import * as yup from 'yup'

const emits = defineEmits(['submit'])

const props = withDefaults(defineProps<{
  step: FormRecordStep,
  displaySubmitButton?: boolean,
  initialData?: Record<string, any>
}>(), {
  displaySubmitButton: true
})
const schema = computed(() => {
  const yupResult: Record<string, any> = {}
  if (!props.step.fields) return yup.object(yupResult)
  props.step.fields.forEach(f => {
    const currentField = []
    switch (f.input) {
      case 'boolean':
        currentField.push('boolean')
        break
      case 'number':
      case 'float':
        currentField.push('number')
        break
      case 'oneline-text':
        currentField.push('string')
        if (f.type === 'email')
          currentField.push('email')
        break
      case 'date':
      case 'datetime':
        currentField.push('date')
        break
      case 'single-data':
      case 'multi-data':
      case 'single-related-data':
      case 'multi-related-data':
      case 'multiline-text':
      default:
        currentField.push('string')
    }
    if (f.rules?.required) {
      currentField.push('required')
    }
    currentField.push(['label', f.label['fr-FR']])
    yupResult[f.name] = currentField.reduce((f, fn: string | [string, string]) => {
      if (typeof fn === 'string')
        return f[fn]()
      else return f[fn[0]](fn[1])
    }, yup)
  })
  return yup.object().shape(yupResult)
})

const dataForm = ref<Record<string, any>>({})

async function onSubmit(values: Record<string, any>) {
  emits('submit', values)
}

/**
 * Affect the local dataForm to the new data received
 */
watch(
  () => props.initialData,
  () => {
    if (!props.initialData) return
    Object.keys(props.initialData!).forEach(key => {
      dataForm.value[key] = props.initialData![key]
    })
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
    :initial-values="props.initialData"
  >
    <template
      v-for="field in props.step.fields"
      :key="field.name"
    >
      <label :for="field.name" class="font-medium mt-2 mb-1">
        {{ field.label['fr-FR'] }}
        <span v-if="field.rules?.required" class="text-red-500">*</span>
      </label>
      <p
        class="text-gray-500 italic mb-2"
        v-if="field.description"
      >
        {{ field.description['fr-FR'] }}
      </p>
      <vv-field
        :name="field.name"
        v-slot="{ handleChange }"
      >
        <prime-input-text
          v-if="field.input === 'oneline-text'"
          :id="field.name"
          v-model="dataForm[field.name]"
          :class="field.class"
          :type="field.type || 'text'"
          :name="field.name"
          @update:model-value="handleChange"
        />
        <textarea
          v-else-if="field.input === 'multiline-text'"
          :id="field.name"
          v-model="dataForm[field.name]"
          class="border rounded"
          :class="field.class"
          rows="5"
          @update:model-value="handleChange"
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
              @update:model-value="handleChange"
            >
            <label :for="choice.value">
              {{ choice.label['fr-FR'] }}
            </label>
          </div>
        </template>
        <template v-else-if="field.input === 'date'">
          <prime-input-text
            type="date"
            class="mb-2"
            v-model="dataForm[field.name]"
            :name="field.name"
            :id="field.name"
            @update:model-value="handleChange"
          />
        </template>
        <template v-else-if="field.input === 'boolean'">
          <prime-toggle-switch
            class="mb-2"
            v-model="dataForm[field.name]"
            :name="field.name"
            :id="field.name"
            @update:model-value="handleChange"
          />
        </template>
      </vv-field>
      <vv-error-message
        :name="field.name"
        :label="field.label['fr-FR']"
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

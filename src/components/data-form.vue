<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import PrimeInputText from 'primevue/inputtext'
import PrimeButton from 'primevue/button'
import PrimeToggleSwitch from 'primevue/inputswitch'
import { type FormRecordStep } from '@/declarations'
import { Form as VvForm, Field as VvField, ErrorMessage as VvErrorMessage } from 'vee-validate'
import { buildYupSchema } from '@/helpers/schema'
import PrimeInputNumber from 'primevue/inputnumber'

const emits = defineEmits(['submit'])

const props = withDefaults(
  defineProps<{
    step: FormRecordStep
    displaySubmitButton?: boolean
    initialData?: Record<string, any>
    submitButtonLabel?: string
    submitButtonDisabled?: boolean
  }>(),
  {
    displaySubmitButton: true,
    submitButtonLabel: "Passer à l'étape suivante",
    submitButtonDisabled: false
  }
)
const schema = computed(() => buildYupSchema(props.step.fields))

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
    Object.keys(props.initialData!).forEach((key) => {
      dataForm.value[key] = props.initialData![key]
    })
  },
  {
    deep: true,
    immediate: true
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
    <template v-for="field in props.step.fields" :key="field.name">
      <label :for="field.name" class="font-medium mt-2 mb-1">
        {{ field.label['fr-FR'] }}
        <span v-if="field.rules?.required" class="text-red-500">*</span>
      </label>
      <p class="text-gray-500 italic mb-2" v-if="field.description">
        {{ field.description['fr-FR'] }}
      </p>
      <vv-field :name="field.name" v-slot="{ handleChange }">
        <input
          v-if="field.input === 'oneline-text'"
          :id="field.name"
          v-model="dataForm[field.name]"
          v-bind="field.attributes"
          class="leading-none m-0 py-2 px-3 rounded-md text-surface-800 dark:text-white/80 placeholder:text-surface-400 dark:placeholder:text-surface-500 bg-surface-0 dark:bg-surface-950 border border-surface-300 dark:border-surface-700 invalid:focus:ring-red-200 invalid:hover:border-red-500 hover:border-surface-400 dark:hover:border-surface-600 focus:outline-none focus:outline-offset-0 focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-400 focus:z-10 appearance-none transition-colors duration-200"
          :class="field.class"
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
          <div v-for="choice in field.values" :key="choice.value" class="mb-2">
            <input
              type="radio"
              :value="choice.value"
              v-model="dataForm[field.name]"
              :name="field.name"
              :id="choice.value"
              class="mr-2"
              @update:model-value="handleChange"
            />
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
        <prime-input-number
          class="mb-2"
          v-else-if="field.input === 'number'"
          v-model="dataForm[field.name]"
          :name="field.name"
          :id="field.name"
          v-bind="field.attributes"
          fluid
          @update:model-value="handleChange"
        />
      </vv-field>
      <vv-error-message :name="field.name" :label="field.label['fr-FR']" class="text-red-500" />
    </template>
    <prime-button
      v-if="displaySubmitButton"
      rounded
      type="submit"
      class="p-2 rounded-lg w-64 mx-auto my-8"
      :disabled="submitButtonDisabled"
      :label="submitButtonLabel"
    />
  </vv-form>
</template>

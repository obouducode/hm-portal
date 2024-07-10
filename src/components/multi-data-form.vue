<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import PrimeInputText from 'primevue/inputtext'
import PrimeButton from 'primevue/button'
import PrimeCalendar from 'primevue/calendar'
import PrimeToggleSwitch from 'primevue/inputswitch'
import { type FormRecordStep } from '@/declarations'
import { Form, Field, FieldArray, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import PrimeTabView from 'primevue/tabview'
import PrimeTabPanel from 'primevue/tabpanel'

const emits = defineEmits(['submit'])

const props = withDefaults(defineProps<{
  step: FormRecordStep,
  displaySubmitButton?: boolean,
  initialValues?: Record<string, any>,
}>(), {
  displaySubmitButton: true,
})

const schema = computed(() => {
  const yupResult: Record<string, any> = {}
  if (!props.step.fields) return yup.object().shape({
    data: yup.array().of(yup.object())
  })
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
  const yupArray = yup.array().of(yup.object().shape(yupResult))
  if (props.step.maxItems) yupArray.max(props.step.maxItems)

  return yup.object().shape({
    data: yupArray
  })
})

const dataForm = ref<Record<string, any>[]>([{}])

async function onSubmit(values: Record<string, any>) {
  console.log('pouet', values)
  emits('submit', { activity: values.data })
}

/**
 * Affect the local dataForm to the new data received
 */
watch(
  () => props.initialValues,
  () => {
    if (!props.initialValues) return
    props.initialValues.data.forEach((d, index) => {
      console.log(d, index)
      dataForm.value[index] = { ...d }
    })
    console.log(dataForm)
  }, {
    deep: true,
    immediate: true,
  }
)

</script>

<template>
  <Form
    class="flex flex-col"
    @submit="onSubmit"
    :validation-schema="schema"
    :initial-values="props.initialValues"
    v-slot="{ errors }"
  >
    <FieldArray name="data" v-slot="{ fields, push, remove }">

      <prime-button
        type="submit"
        class="border p-2 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 font-bold mx-auto my-8 block"
        @click="dataForm.push({}) && push({})"
        :disabled="fields.length === 3"
      >
        Ajouter une inscription à une activité (max 3)
      </prime-button>

      <prime-tab-view :multiple="true">
        <template
          v-for="(dataFormItem, idx) in fields"
          :key="idx"
        >
          <prime-tab-panel class="flex flex-col"
            :header="`Activité n° ${ idx + 1 }`"
          >
            <div class="flex flex-col">
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
                <Field
                  :name="`data[${idx}].${field.name}`"
                  :label="field.label['fr-FR']"
                  v-slot="{ handleChange }"
                >
                  <prime-input-text
                    v-if="field.input === 'oneline-text'"
                    :id="`data[${idx}][${field.name}]`"
                    v-model="dataForm[idx][field.name]"
                    :class="field.class"
                    :type="field.type || 'text'"
                    :name="field.name"
                    @update:model-value="handleChange"
                  />
                  <textarea
                    v-else-if="field.input === 'multiline-text'"
                    :id="`data[${idx}][${field.name}]`"
                    v-model="dataForm[idx][field.name]"
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
                        v-model="dataForm[idx][field.name]"
                        :name="`data[${idx}].${field.name}`"
                        :id="`[${idx}]${choice.value}`"
                        class="mr-2"
                        @update:model-value="handleChange"
                      >
                      <label :for="`[${idx}]${choice.value}`">
                        {{ choice.label['fr-FR'] }}
                      </label>
                    </div>
                  </template>
                  <template v-else-if="field.input === 'date'">
                    <prime-calendar
                      class="mb-2"
                      v-model="dataForm[idx][field.name]"
                      :name="field.name"
                      :id="`data[${idx}][${field.name}]`"
                      @update:model-value="handleChange"
                    />
                  </template>
                  <template v-else-if="field.input === 'boolean'">
                    <prime-toggle-switch
                      class="mb-2"
                      v-model="dataForm[idx][field.name]"
                      :name="field.name"
                      :id="`data[${idx}][${field.name}]`"
                      @update:model-value="handleChange"
                    />
                  </template>
                </Field>
                <ErrorMessage
                  :name="`data[${idx}].${field.name}`"
                  :label="field.label['fr-FR']"
                  class="text-red-500"
                />
              </template>


              <prime-button
                type="button"
                @click="remove(idx)"
                severity="danger"

              >Supprimer cette activité</prime-button>
            </div>
          </prime-tab-panel>
        </template>
      </prime-tab-view>

    </FieldArray>


    <div v-if="Object.keys(errors).length > 0" class="text-red-500 mx-auto">
      Des erreurs sont présentes dans le formulaire (pensez à bien vérifier les différentes activités)
    </div>

    <prime-button
      v-if="displaySubmitButton"
      type="submit"
      class="border p-2 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 font-bold w-64 mx-auto my-8"
    >
      Passer à l'étape suivante
    </prime-button>

  </Form>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue'
import InputText from 'primevue/inputtext'
import PrimeButton from 'primevue/button'
import { type FormRecordStep } from '@/declarations';

const emits = defineEmits(['submit'])

const props = defineProps<{
  step: FormRecordStep
}>()

const dataForm = ref<Record<string, string | number | boolean | null>>({})

function onSubmit() {
  emits('submit', dataForm)
}

</script>

<template>
  <form class="flex flex-col">
<!--     <template
      v-for="field in props.step.fields"
      :key="field.name"
    >
      <label :for="field.name" class="font-bold mt-2 mb-1">
        {{ field.label['fr-FR'] }}
        <span v-if="field.rules.required" class="text-red-500">*</span>
      </label>
      {{ field }}
      <input-text
        v-if="field.input === 'oneline-text'"
        :id="field.name"
        v-model="dataForm[field.name]"
        :class="field.class"
      />
      <template v-if="field.input === 'single-data'">
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
    </template> -->
    <prime-button
      type="submit"
      class="border p-2 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 font-bold w-64 mx-auto my-8"
      @click="onSubmit"
    >
      Passer à l'étape suivante
    </prime-button>
  </form>
</template>

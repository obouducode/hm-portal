type I18nLang = 'fr-FR' | 'en-EN'

type FormRecordFieldInput =
  'boolean' |
  'oneline-text' | 'multiline-text' |
  'number' | 'float' |
  'date' | 'datetime' |
  'single-data' | 'multi-data' |
  'single-related-data' | 'multi-related-data' |
  // none will be a display-only field
  'none'

interface FormRecordBase {
  label: Record<I18nLang, string>
  placeholder?: Record<I18nLang, string>
  description?: Record<I18nLang, string>
}

/**
 * Field of a form,
 * related to one single input
 */
interface FormRecordFieldBase extends FormRecordBase {
  // CSS classes
  class?: string
  // property name of the field
  name: string
  input: FormRecordFieldInput
  rules?: Partial<{
    required: boolean
    minLength: number
    maxLength: number
  }>
}

/**
 * Boolean fields
 */
interface FormRecordFieldBoolean extends FormRecordFieldBase {
  input: 'boolean'
  display?: 'checkbox' | 'toggle'
}

/**
 * Text fields
 */
interface FormRecordFieldOnelineText extends FormRecordFieldBase {
  input: 'oneline-text'
  type?: 'email' | 'url' | 'tel' | 'text'
}
interface FormRecordFieldMultilineText extends FormRecordFieldBase {
  input: 'multiline-text'
}

/**
 * Number fields
 */
interface FormRecordFieldNumber extends FormRecordFieldBase {
  input: 'number'
}
interface FormRecordFieldFloat extends FormRecordFieldBase {
  input: 'float'
}

/**
 * Date fields
 */
interface FormRecordFieldDate extends FormRecordFieldBase {
  input: 'date'
  display?: 'input' | 'calendar'
}
interface FormRecordFieldDatetime extends FormRecordFieldBase {
  input: 'datetime'
}

/**
 * Field with limited choices
 */
type SingleDataValue = FormRecordBase & {
  value: string
  default?: boolean
}
interface FormRecordFieldSingleData extends FormRecordFieldBase {
  input: 'single-data'
  display?: 'radio' | 'dropdown'
  values: SingleDataValue[]
}
interface FormRecordFieldMultiData extends FormRecordFieldBase {
  input: 'multi-data'
  display?: 'checkbox' | 'dropdown'
  values: SingleDataValue[]
}

/**
 * Field with choices from external ressource
 */
interface FormRecordFieldSingleRelatedData extends FormRecordFieldBase {
  input: 'single-related-data'
  display: 'dropdown'
  endpoint: string
  valueField: string
  labelField: string
}
interface FormRecordFieldMultiRelatedData extends FormRecordFieldBase {
  input: 'multi-related-data'
  display: 'dropdown'
  endpoint: string
  valueField: string
  labelField: string
}

type FormRecordField =
  FormRecordFieldBoolean |
  FormRecordFieldOnelineText | FormRecordFieldMultilineText |
  FormRecordFieldNumber | FormRecordFieldFloat |
  FormRecordFieldDate | FormRecordFieldDatetime |
  FormRecordFieldSingleData | FormRecordFieldMultiData |
  FormRecordFieldSingleRelatedData | FormRecordFieldMultiRelatedData

/**
 * Display element for a form
 */
interface FormRecordBlock extends FormRecordBase {
  class: string
  /**
   * fields to be displayed in the block,
   * referencing fields of the current step
   */
  fields: {
    name: string
    class: string
  }[]
}

export interface FormRecordStep extends FormRecordBase {
  /**
   * All fields needed for this step
   *
   * Can be empty if the step
   * is for display purpose
   */
  fields?: FormRecordField[]

  /**
   * How the fields are displayed to the user
   *
   * Blocks are also for display purpose
   */
  blocks?: FormRecordBlock[]

  /**
   * Property name of the bounded value
   * where to store the fields' values
   *
   * If undefined / null,
   * all fields' values will be set
   * at the root level of the bounded value form
   */
  property?: string

  /**
   * Do this property a multiple one,
   * and if so, we store values in an array.
   *
   * Max items can be set too to limit the number of items.
   */
  array?: boolean
  maxItems?: number

  /**
   * Is this step a summary ?
   *
   * Sum up all data field by user
   */
  summary?: boolean
}

/**
 * Definition for a LocoKit form
 */
export interface FormRecord extends FormRecordBase {
  /**
   * Is the form a multistep one ?
   *
   * if so, steps will be an array of more
   * than 1 element.
   *
   * may not be useful if we can compute
   * it directly from the steps array's length
   */
  multisteps: boolean

  /**
   * Set of all steps
   * making the form
   */
  steps: FormRecordStep[]

  /**
   * do we store data in local storage temporary,
   * to allow user go back to input, later in time
   */

}

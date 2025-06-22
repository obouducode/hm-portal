import { type FormRecordField } from '@/declarations'
import * as yup from 'yup'

export function buildYupSchema(fields: FormRecordField[] = []) {
  const yupResult: Record<string, any> = {}
  fields.forEach((f) => {
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
        if (f.attributes?.type === 'email') currentField.push('email')
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
    /*    if (f.rules?.match) {
      currentField.
    }*/
    currentField.push(['label', f.label['fr-FR']])
    yupResult[f.name] = currentField.reduce((f, fn: string | [string, string]) => {
      if (typeof fn === 'string') return f[fn]()
      else return f[fn[0]](fn[1])
    }, yup)
  })
  console.log(yupResult)
  return yup.object().shape(yupResult)
}

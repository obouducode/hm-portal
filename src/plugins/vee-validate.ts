import { configure, defineRule } from 'vee-validate'
import { email, required, regex } from '@vee-validate/rules'
import { localize } from '@vee-validate/i18n'

const messages = {
  "required": "Le champ '{field}' est requis.",
  "email": "L'email du champ '{field}' ne correspond pas au format attendu."
}
defineRule('email', email)
defineRule('required', required)
defineRule('regex', regex)

configure({
  bails: false,
  validateOnBlur: true,
  validateOnChange: false,
  validateOnInput: false,
  validateOnModelUpdate: false,
  generateMessage: context => {
    console.log(context.field, context.rule)
    return `The field ${context.field} is invalid`;
  }
})

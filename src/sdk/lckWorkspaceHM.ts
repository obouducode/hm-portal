import { lckClient } from './index'

const BASE_HM_DS = 'workspace/hm_bo/datasource/datasource_hm'
const BASE_HM_TABLE = BASE_HM_DS + '/table'
const BASE_HM_WORKFLOW = BASE_HM_DS + '/workflow'

export const lckWorkspaceHM = {
  tables: {
    membership: {
      record: lckClient.service(`${BASE_HM_TABLE}/membership/record`),
      field: lckClient.service(`${BASE_HM_TABLE}/membership/field`),
    },
    membership_person: {
      record: lckClient.service(`${BASE_HM_TABLE}/membership_person/record`),
      field: lckClient.service(`${BASE_HM_TABLE}/membership_person/field`),
    },
    payment: {
      record: lckClient.service(`${BASE_HM_TABLE}/payment/record`),
      field: lckClient.service(`${BASE_HM_TABLE}/payment/field`),
    },
    paymentStep: {
      record: lckClient.service(`${BASE_HM_TABLE}/payment_step/record`),
      field: lckClient.service(`${BASE_HM_TABLE}/payment_step/field`),
    },
    registration: {
      record: lckClient.service(`${BASE_HM_TABLE}/registration/record`),
      field: lckClient.service(`${BASE_HM_TABLE}/registration/field`),
    },
  },
  workflows: {

  }
}
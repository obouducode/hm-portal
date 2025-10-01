type MsGlossary = {
  id: string
  name: string
  slug: string
}

type MsSeason = MsGlossary

type MsMembershipPerson = {
  id: string
  membership_family_id: string // link to the matching MsMembership
  membership?: MsMembership
  lastname: string
  firstname: string
  registration?: MsRegistration[]
}

type MsMembership = {
  id: string
  lastname: string
  firstname: string
  email_1: string
  email_2?: string
  tel_1: string
  tel_2?: string
  zipcode: string
  address: string
  city: string
  family_quotient: string
  family_quotient_amount: number
  broadcast_right: boolean
  rules_respect: boolean
  last_form_data: object
  payment?: MsPayment[]
  membership_person?: MsMembershipPerson[]
}

type MsPayment = {
  id: string
  method: string
  number: string
  membership_id: string // link to the matching MsMembership
  information: string
  season_id: string // link to the matching season
  created_at: string
  updated_at: string
  payment_step?: MsPaymentStep[]
  category_price: number
  category_amount: number
  approval_rules: boolean
  approval_broadcast_image: boolean
  status: 'COMPLETED' | 'MISSING_INFO' | 'MISSING_MONEY' | 'NO_MONEY' | 'TO_CHECK'
  total_amount: number
}

type MsPaymentStep = {
  id: string
  payment_id: string // link to the matching MsPayment
  method: string
  amount: number
  information: string
  other_method: string
  planned_receipt_date: string
  receipt_date: string
}

type MsActivityCourse = MsGlossary & {
  price_quotient1: number
  price_quotient2: number
  price_quotient3: number
  price_quotient4: number
  season_id: number
}

type MsActivityInstrument = MsGlossary

type MsRegistration = {
  membership_person_id: string
  membership_person?: MsMembershipPerson
  activity_course_id: string
  activity_course?: MsActivityCourse
  activity_instrument_id?: string
  activity_instrument?: MsActivityInstrument
  information: string
  cancelled: boolean
  cancelation_date: string
  cancelation_reason: string
  price?: number
  discount?: number
  final_price?: number
  workshop_choice_1?: string
  workshop_choice_2?: string
  workshop_choice_3?: string
  activity_want_music_book: boolean
  activity_teach_year: number
}

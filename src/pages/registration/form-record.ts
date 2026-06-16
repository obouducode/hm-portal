import { type FormRecord } from '@/declarations'
import { FIELD_COMPONENT, FIELD_TYPE } from '@locokit/definitions'
import type { FormFieldState } from '@primevue/forms'
import {
  courses,
  instruments,
  workshops,
  teach_years,
  categories
} from './form-record-data-2026-2027'

export const formRecord: FormRecord = {
  label: 'Formulaire inscription',
  description: [''],
  multisteps: true,
  steps: [
    {
      label: 'Accueil',
      description: ['']
    },
    {
      label: 'Adhésion',
      description: [
        "Merci de renseigner les informations de l'adhérent ou de son-sa représentant-e légal-e"
      ],
      property: 'membership',
      fields: [
        {
          label: 'NOM',
          id: 'membership_lastname',
          component: FIELD_COMPONENT.INPUT_TEXT,
          type: FIELD_TYPE.STRING,
          settings: {
            default: {
              validation: {
                required: true
              }
            }
          }
        },
        {
          label: 'Prénom',
          id: 'membership_firstname',
          component: FIELD_COMPONENT.INPUT_TEXT,
          type: FIELD_TYPE.STRING,
          settings: {
            default: {
              validation: {
                required: true
              }
            }
          }
        },
        {
          label: 'Mail n°1 de contact',
          id: 'membership_email_1',
          component: FIELD_COMPONENT.INPUT_EMAIL,
          settings: {
            default: {
              validation: {
                required: true
              }
            }
          }
        },
        {
          label: 'Mail n°2 de contact',
          id: 'membership_email_2',
          component: FIELD_COMPONENT.INPUT_EMAIL,
          type: FIELD_TYPE.STRING
        },
        {
          label: 'Tél n°1 de contact',
          id: 'membership_tel_1',
          component: FIELD_COMPONENT.INPUT_TEXT,
          type: FIELD_TYPE.STRING,
          attrs: function ($field: any) {
            return {
              type: 'tel',
              onChange: $field.onChange
            }
          },
          settings: {
            default: {
              validation: {
                required: true
              }
            }
          }
        },
        {
          label: 'Tél n°2 de contact',
          id: 'membership_tel_2',
          component: FIELD_COMPONENT.INPUT_TEXT,
          type: FIELD_TYPE.STRING,
          attrs: function ($field: any) {
            return {
              type: 'tel',
              onChange: $field.onChange
            }
          }
        },
        {
          label: 'Adresse',
          id: 'membership_address',
          component: FIELD_COMPONENT.INPUT_TEXT,
          type: FIELD_TYPE.STRING
        },
        {
          label: 'Code postal',
          id: 'membership_zipcode',
          component: FIELD_COMPONENT.INPUT_TEXT,
          type: FIELD_TYPE.STRING,
          attrs: function ($field: any) {
            return {
              minlength: 5,
              maxlength: 5,
              inputmode: 'numeric',
              onChange: $field.onChange
            }
          },
          settings: {
            default: {
              validation: {
                required: true
              }
            }
          }
        },
        {
          label: 'Ville',
          id: 'membership_city',
          component: FIELD_COMPONENT.INPUT_TEXT,
          type: FIELD_TYPE.STRING,
          settings: {
            default: {
              validation: {
                required: true
              }
            }
          }
        },
        {
          label: 'Montant du quotient familial',
          description: ['Montant fourni par la CAF pour le calcul de la tranche'],
          id: 'category_amount',
          component: FIELD_COMPONENT.INPUT_NUMBER,
          type: FIELD_TYPE.NUMBER,
          attrs: function ($field: any) {
            return {
              type: 'number',
              onChange: $field.onChange
            }
          }
        },
        {
          label: 'Tranche Héric Musique liée au quotient familial',
          description: [
            "Si tranche 1 à 3, merci de nous fournir l'attestation de la CAF correspondante lors du paiement Hello Asso, par mail ou en main propre. Vous pouvez la trouver sur le site de la CAF. Pour les choristes ou hors cursus, choisissez la tranche 4 si vous ne la connaissez pas."
          ],
          id: 'category_price',
          type: FIELD_TYPE.STRING,
          component: FIELD_COMPONENT.SINGLE_SELECT,
          defaultValue() {
            return 4
          },
          source: {
            options: categories,
            label: 'label',
            value: 'value'
          },
          settings: {
            default: {
              validation: {
                required: true
              }
            }
          }
        }
      ]
    },
    {
      label: 'Activité(s)',
      description: ['Merci de renseigner chaque élève et son activité associée.'],
      property: 'activity',
      array: true,
      maxRecords: 3,
      recordTitle: (
        record: {
          [key: string]: FormFieldState
        },
        idx: number
      ) =>
        `Élève / cours ${idx + 1} : ${record['form_' + idx + '_activity_lastname']?.value || ''} ${record['form_' + idx + '_activity_firstname']?.value || ''}`,
      fields: [
        {
          label: 'NOM',
          id: 'activity_lastname',
          component: FIELD_COMPONENT.INPUT_TEXT,
          type: FIELD_TYPE.STRING,
          settings: {
            default: {
              validation: {
                required: true
              }
            }
          }
        },
        {
          label: 'Prénom',
          id: 'activity_firstname',
          component: FIELD_COMPONENT.INPUT_TEXT,
          type: FIELD_TYPE.STRING,
          settings: {
            default: {
              validation: {
                required: true
              }
            }
          }
        },
        {
          label: 'Date de naissance',
          id: 'activity_birthday',
          component: FIELD_COMPONENT.INPUT_DATE,
          type: FIELD_TYPE.DATE,
          settings: {
            default: {
              validation: {
                required: true
              }
            }
          }
        },
        {
          id: 'activity_course',
          label: 'Cours',
          type: FIELD_TYPE.STRING,
          component: FIELD_COMPONENT.SINGLE_SELECT,
          settings: {
            default: {
              validation: {
                required: true
              }
            }
          },
          source: {
            options: courses,
            label: 'label',
            value: 'value'
          }
        },
        {
          id: 'activity_instrument',
          label: 'Instrument',
          description: ["Si applicable, choisir l'instrument"],
          type: FIELD_TYPE.STRING,
          component: FIELD_COMPONENT.SINGLE_SELECT,
          source: {
            options: instruments,
            label: 'label',
            value: 'value'
          },
          settings: {
            default: {
              display: {
                visible: false
              },
              validation: {
                required: false
              }
            },
            rules: [
              {
                conditions: [
                  {
                    fieldId: 'activity_course',
                    operator: '$in',
                    value: [
                      '2026_instru_cycle1',
                      '2026_instru_cycle2',
                      '2026_horscursus_instru_30mn_hebdo',
                      '2026_horscursus_instru_30mn_15J',
                      '2026_combo_horscursus_instru_30mn_hebdo_atelier',
                      '2026_combo_horscursus_instru_30mn_15J_atelier'
                    ]
                  }
                ],
                impact: {
                  display: {
                    visible: true
                  },
                  validation: {
                    required: true
                  }
                }
              }
            ]
          }
        },
        {
          id: 'activity_teach_year',
          label: 'Formation musicale',
          description: ["Si applicable, choisir l'année de la formation musicale"],
          type: FIELD_TYPE.STRING,
          component: FIELD_COMPONENT.SINGLE_SELECT,
          source: {
            options: teach_years,
            label: 'label',
            value: 'value'
          },
          settings: {
            default: {
              display: {
                visible: false
              },
              validation: {
                required: false
              }
            },
            rules: [
              {
                conditions: [
                  {
                    fieldId: 'activity_course',
                    operator: '$eq',
                    value: '2026_instru_cycle1'
                  }
                ],
                impact: {
                  display: {
                    visible: true
                  },
                  validation: {
                    required: true
                  }
                }
              }
            ]
          }
        },
        {
          label: 'Achat du livret de formation musicale',
          description: [
            "Vous pouvez demander le livret de la formation musicale, nous ferons une commande groupée. (~26€ selon l'année)"
          ],
          id: 'activity_want_music_book',
          type: FIELD_TYPE.BOOLEAN,
          component: FIELD_COMPONENT.TOGGLE_SWITCH,
          settings: {
            default: {
              display: {
                visible: false
              },
              validation: {
                required: false
              }
            },
            rules: [
              {
                conditions: [
                  {
                    fieldId: 'activity_course',
                    operator: '$eq',
                    value: '2026_instru_cycle1'
                  }
                ],
                impact: {
                  display: {
                    visible: true
                  }
                }
              }
            ]
          }
        },
        {
          label: 'Atelier musical (choix 1)',
          description: [
            'Vous pouvez choisir 3 projets par ordre de priorité.',
            'Retrouvez les ateliers sur https://www.hericmusique.fr/index.php/heures-projet/ .'
          ],
          id: 'activity_workshop_choice_1',
          type: FIELD_TYPE.STRING,
          component: FIELD_COMPONENT.SINGLE_SELECT,
          source: {
            options: workshops,
            label: 'label',
            value: 'value'
          },
          settings: {
            default: {
              display: {
                visible: false
              },
              validation: {
                required: false
              }
            },
            rules: [
              {
                conditions: [
                  {
                    fieldId: 'activity_course',
                    operator: '$in',
                    value: ['2026_instru_cycle1', '2026_instru_cycle2']
                  }
                ],
                impact: {
                  display: {
                    visible: true
                  },
                  validation: {
                    required: true
                  }
                }
              }
            ]
          }
        },
        {
          label: 'Atelier musical (choix 2)',
          id: 'activity_workshop_choice_2',
          type: FIELD_TYPE.STRING,
          component: FIELD_COMPONENT.SINGLE_SELECT,
          source: {
            options: workshops,
            label: 'label',
            value: 'value'
          },
          settings: {
            default: {
              display: {
                visible: false
              },
              validation: {
                required: false
              }
            },
            rules: [
              {
                conditions: [
                  {
                    fieldId: 'activity_course',
                    operator: '$in',
                    value: ['2026_instru_cycle1', '2026_instru_cycle2']
                  }
                ],
                impact: {
                  display: {
                    visible: true
                  }
                }
              }
            ]
          }
        },
        {
          label: 'Atelier musical (choix 3)',
          id: 'activity_workshop_choice_3',
          type: FIELD_TYPE.STRING,
          component: FIELD_COMPONENT.SINGLE_SELECT,
          source: {
            options: workshops,
            label: 'label',
            value: 'value'
          },
          settings: {
            default: {
              display: {
                visible: false
              },
              validation: {
                required: false
              }
            },
            rules: [
              {
                conditions: [
                  {
                    fieldId: 'activity_course',
                    operator: '$in',
                    value: ['2026_instru_cycle1', '2026_instru_cycle2']
                  }
                ],
                impact: {
                  display: {
                    visible: true
                  }
                }
              }
            ]
          }
        },
        {
          label: 'Besoins particuliers (PAI, accompagnement, horaires privilégiés, fréquence...)',
          id: 'activity_information',
          type: FIELD_TYPE.STRING,
          component: FIELD_COMPONENT.TEXTAREA
        }
      ]
    },
    {
      label: 'Paiement',
      summary: true,
      description: ['Merci de préciser vos modalités de paiement.'],
      fields: [
        {
          label: 'Information sur paiements',
          description: [
            'En cas de paiement par chèque, vous pouvez préciser au dos le mois d\'encaissement souhaité.',
            'Nous procédons aux encaissements entre le 27 du mois courant et le 5 du mois suivant.',
            'Si aucun souhait n\'est précisé, nous ventilons les encaissements sur toute l\'année.'
          ],
          id: 'payment_information',
          type: FIELD_TYPE.STRING,
          component: FIELD_COMPONENT.TEXTAREA
        },
        {
          label: 'Moyen de paiement',
          description: [''],
          id: 'payment_method',
          type: FIELD_TYPE.STRING,
          component: FIELD_COMPONENT.SINGLE_SELECT,
          source: {
            options: [
              {
                label: 'Chèque(s)',
                value: 'cheque'
              },
              {
                label: 'Espèces',
                value: 'espece'
              },
              {
                label: 'Hello Asso',
                value: 'hello_asso'
              },
              {
                label: 'Autre',
                value: 'autre'
              }
            ],
            label: 'label',
            value: 'value'
          },
          settings: {
            default: {
              validation: {
                required: true
              }
            }
          }
        }
      ]
    },
    {
      label: 'Récap',
      summary: true,
      description: [''],
      fields: [
        {
          label: 'Droits de diffusion',
          description: [
            "Vous autorisez l'association Héric Musique à afficher ou publier, à des fins de promotion ou de communication, une photographie ou une vidéo sur laquelle figure un des élèves mentionnés dans ce formulaire."
          ],
          id: 'broadcast_right',
          type: FIELD_TYPE.STRING,
          component: FIELD_COMPONENT.INPUT_RADIO,
          class: 'flex flex-col gap-2 mt-2',
          source: {
            options: [
              {
                label: "J'autorise",
                value: 'yes',
                default: true
              },
              {
                label: "Je n'autorise pas",
                value: 'no'
              }
            ],
            label: 'label',
            value: 'value'
          },
          settings: {
            default: {
              validation: {
                required: true
              }
            }
          }
        },
        {
          label: 'Règlement intérieur',
          description: [
            "Vous vous engagez à respecter le règlement intérieur de l'association Héric Musique"
          ],
          id: 'rules_respect',
          type: FIELD_TYPE.STRING,
          component: FIELD_COMPONENT.INPUT_RADIO,
          class: 'flex flex-col gap-2 mt-2',
          source: {
            options: [
              {
                label: "Je m'y engage",
                value: 'yes',
                default: true
              },
              {
                label: 'Je ne souhaite pas continuer',
                value: 'no'
              }
            ],
            label: 'label',
            value: 'value'
          },
          settings: {
            default: {
              validation: {
                required: true,
                match: 'yes'
              }
            }
          }
        }
      ]
    }
  ]
}

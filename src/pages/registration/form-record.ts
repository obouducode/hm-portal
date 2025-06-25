import { type FormRecord } from '@/declarations'
import { FIELD_COMPONENT, FIELD_TYPE } from '@locokit/definitions'
import type { FormFieldState } from '@primevue/forms'

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
          id: 'membership_family_quotient_amount',
          component: FIELD_COMPONENT.INPUT_TEXT,
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
          id: 'membership_family_quotient',
          type: FIELD_TYPE.STRING,
          component: FIELD_COMPONENT.SINGLE_SELECT,
          defaultValue() {
            return 'tranche4'
          },
          source: {
            options: [
              {
                label: 'Tranche 1 (0 - 550 €)',
                value: 'tranche1'
              },
              {
                label: 'Tranche 2 (551 - 800 €)',
                value: 'tranche2'
              },
              {
                label: 'Tranche 3 (801 - 1050 €)',
                value: 'tranche3'
              },
              {
                label: 'Tranche 4 (> 1051 €) ou choriste/hors cursus',
                value: 'tranche4'
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
            options: [
              {
                label: 'Éveil musical',
                value: '2025_eveil'
              },
              {
                label: 'Initiation multi-instrumentale',
                value: '2025_multi'
              },
              {
                label: 'Instrument Cycle 1 (≤ 4 ans) + projet collectif + Formation Musicale',
                value: '2025_instru_cycle1'
              },
              {
                label: 'Instrument Cycle 2 (> 4 ans) + Projet collectif',
                value: '2025_instru_cycle2'
              },

              {
                label: 'Hors cursus Instrument 30mn hebdo',
                value: '2025_horscursus_instru'
              },
              {
                label: 'Hors cursus Instrument 30mn tous les 15 J',
                value: '2025_horscursus_instru_30mn_15J'
              },

              {
                label: 'Hors cursus Chant individuel 30mn hebdo',
                value: '2025_horscursus_chant_individuel'
              },
              {
                label: 'Hors Cursus Chant individuel 30mn tous les 15 J',
                value: '2025_horscursus_chant_individuel_30mn_15J'
              },
              {
                label: 'Hors Cursus Chorale enfants',
                value: '2025_horscursus_chorale_enfants'
              },

              {
                label: 'Hors cursus Batucada',
                value: '2025_horscursus_batuc'
              },
              {
                label: 'Hors Cursus Percussion africaines enfants, ados',
                value: '2025_horscursus_percu_enfants'
              },
              {
                label: 'Hors cursus Percussions',
                value: '2025_horscursus_percu'
              },
              {
                label: 'Hors cursus Atelier Jazz / Rock',
                value: '2025_horscursus_atelier'
              },
              {
                label: 'Hors cursus Atelier vocal',
                value: '2025_horscursus_atelier_vocal'
              },
              {
                label: 'Hors cursus Boeuf sur le toit',
                value: '2025_horscursus_boeuf'
              },
              {
                label: 'Hors cursus Ensemble vocal',
                value: '2025_horscursus_chorale'
              }
            ],
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
            options: [
              {
                label: 'Accordéon',
                value: 'accordeon'
              },
              {
                label: 'Basse',
                value: 'basse'
              },
              {
                label: 'Batterie',
                value: 'batterie'
              },
              {
                label: 'Clarinette',
                value: 'clarinette'
              },
              {
                label: 'Contrebasse',
                value: 'contrebasse'
              },
              {
                label: 'Flûte',
                value: 'flute'
              },
              {
                label: 'Guitare classique',
                value: 'guitare_classique'
              },
              {
                label: 'Guitare électrique',
                value: 'guitare_electrique'
              },
              {
                label: 'Piano',
                value: 'piano'
              },
              {
                label: 'Saxophone',
                value: 'saxophone'
              }
            ],
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
                    value: ['2025_instru_cycle1', '2025_instru_cycle2']
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
            options: [
              {
                label: '1ère année',
                value: 'first_year'
              },
              {
                label: '2ème année',
                value: 'second'
              },
              {
                label: '3ème année',
                value: 'third'
              },
              {
                label: '4ème année',
                value: 'fourth'
              }
            ],
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
                    value: '2025_instru_cycle1'
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
                    value: '2025_instru_cycle1'
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
          description: ['Vous pouvez choisir 3 projets par ordre de priorité'],
          id: 'activity_workshop_choice',
          type: FIELD_TYPE.STRING,
          component: FIELD_COMPONENT.SINGLE_SELECT,
          source: {
            options: [
              {
                label: 'Atelier Virginie Carnaval',
                value: 'first_year'
              },
              {
                label: 'Atelier Ellen Chant',
                value: 'second'
              },
              {
                label: 'Atelier Martine les Ogres de Barbak',
                value: 'third'
              },
              {
                label: 'Atelier Sophie Groupe',
                value: 'fourth'
              }
            ],
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
                    value: '2025_instru_cycle1'
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
            options: [
              {
                label: 'Atelier Virginie Carnaval',
                value: 'first_year'
              },
              {
                label: 'Atelier Ellen Chant',
                value: 'second'
              },
              {
                label: 'Atelier Martine les Ogres de Barbak',
                value: 'third'
              },
              {
                label: 'Atelier Sophie Groupe',
                value: 'fourth'
              }
            ],
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
                    value: '2025_instru_cycle1'
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
            options: [
              {
                label: 'Atelier Virginie Carnaval',
                value: 'first_year'
              },
              {
                label: 'Atelier Ellen Chant',
                value: 'second'
              },
              {
                label: 'Atelier Martine les Ogres de Barbak',
                value: 'third'
              },
              {
                label: 'Atelier Sophie Groupe',
                value: 'fourth'
              }
            ],
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
                    value: '2025_instru_cycle1'
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
          label: 'Atelier musical',
          description: ['Vous pouvez choisir 3 projets par ordre de priorité'],
          id: 'activity_workshop_choice_1',
          type: FIELD_TYPE.STRING,
          component: FIELD_COMPONENT.SINGLE_SELECT,
          source: {
            options: [
              {
                label: 'Atelier Virginie Carnaval',
                value: 'first_year'
              },
              {
                label: 'Atelier Ellen Chant',
                value: 'second'
              },
              {
                label: 'Atelier Martine les Ogres de Barbak',
                value: 'third'
              },
              {
                label: 'Atelier Sophie Groupe',
                value: 'fourth'
              }
            ],
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
                    value: '2025_instru_cycle1'
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
      description: ['Merci de renseigner vos modalités de paiement'],
      fields: [
        {
          label: 'Information sur paiements',
          description: [''],
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

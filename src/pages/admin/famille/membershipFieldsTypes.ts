export const membershipFields = [
  {
    label: {
      'fr-FR': 'NOM',
      'en-EN': 'Last name'
    },
    name: 'lastname',
    input: 'oneline-text',
    rules: {
      required: true
    }
  },
  {
    label: {
      'fr-FR': 'Prénom',
      'en-EN': 'First name'
    },
    name: 'firstname',
    input: 'oneline-text',
    rules: {
      required: true
    }
  },
  {
    label: {
      'fr-FR': 'Mail n°1 de contact',
      'en-EN': 'Mail n°1 de contact'
    },
    name: 'email_1',
    input: 'oneline-text',
    attributes: {
      type: 'email'
    },
    rules: {
      required: true
    }
  },
  {
    label: {
      'fr-FR': 'Mail n°2 de contact',
      'en-EN': 'Mail n°2 de contact'
    },
    name: 'email_2',
    input: 'oneline-text',
    attributes: {
      type: 'email'
    }
  },
  {
    label: {
      'fr-FR': 'Tél n°1 de contact',
      'en-EN': 'Tél n°1 de contact'
    },
    name: 'tel_1',
    input: 'oneline-text',
    attributes: {
      type: 'tel'
    },
    rules: {
      required: true
    }
  },
  {
    label: {
      'fr-FR': 'Tél n°2 de contact',
      'en-EN': 'Tél n°2 de contact'
    },
    name: 'tel_2',
    input: 'oneline-text',
    attributes: {
      type: 'tel'
    }
  },
  {
    label: {
      'fr-FR': 'Adresse',
      'en-EN': 'Adresse'
    },
    name: 'address',
    input: 'oneline-text'
  },
  {
    label: {
      'fr-FR': 'Code postal',
      'en-EN': 'Code postal'
    },
    name: 'zipcode',
    input: 'oneline-text',
    attributes: {
      minlength: 5,
      maxlength: 5,
      inputmode: 'numeric'
    },
    rules: {
      required: true
    }
  },
  {
    label: {
      'fr-FR': 'Ville',
      'en-EN': 'Ville'
    },
    name: 'city',
    input: 'oneline-text',
    rules: {
      required: true
    }
  },
  {
    label: {
      'fr-FR': 'Quotient familial',
      'en-EN': 'Quotient familial'
    },
    description: {
      'fr-FR':
        "Si tranche 1 à 3, merci de nous fournir l'attestation de la CAF correspondante lors du paiement Hello Asso, par mail ou en main propre. Vous pouvez la trouver sur le site de la CAF. Pour les choristes ou hors cursus, choisissez la tranche 4 si vous ne la connaissez pas.",
      'en-EN': "Si tranche 1 à 3, merci de nous fournir l'attestation de la CAF correspondante"
    },
    name: 'family_quotient',
    input: 'single-data',
    display: 'radio',
    values: [
      {
        label: {
          'fr-FR': 'Tranche 1 (0 - 550 €)',
          'en-EN': 'Tranche 1 (0 - 550 €)'
        },
        value: 'tranche1'
      },
      {
        label: {
          'fr-FR': 'Tranche 2 (551 - 800 €)',
          'en-EN': 'Tranche 2 (551 - 800 €)'
        },
        value: 'tranche2'
      },
      {
        label: {
          'fr-FR': 'Tranche 3 (801 - 1050 €)',
          'en-EN': 'Tranche 3 (801 - 1050 €)'
        },
        value: 'tranche3'
      },
      {
        label: {
          'fr-FR': 'Tranche 4 (> 1051 €) ou choriste/hors cursus',
          'en-EN': 'Tranche 4 (> 1051 €) ou choriste/hors cursus'
        },
        value: 'tranche4',
        default: true
      }
    ],
    rules: {
      required: true
    }
  }
]

export const membershipPersonFields = [
  {
    label: {
      'fr-FR': 'NOM',
      'en-EN': 'Last name'
    },
    name: 'lastname',
    input: 'oneline-text',
    rules: {
      required: true
    }
  },
  {
    label: {
      'fr-FR': 'Prénom',
      'en-EN': 'First name'
    },
    name: 'firstname',
    input: 'oneline-text',
    rules: {
      required: true
    }
  },
  {
    label: {
      'fr-FR': 'Date de naissance',
      'en-EN': 'Birthday'
    },
    name: 'birthday',
    input: 'date',
    rules: {
      required: true
    }
  },
  {
    label: {
      'fr-FR': 'Cours',
      'en-EN': 'Cours'
    },
    name: 'course',
    input: 'single-data',
    rules: {
      required: true
    },
    values: [
      {
        label: {
          'fr-FR': 'Eveil musical',
          'en-EN': 'Eveil musical'
        },
        value: '2024_eveil'
      },
      {
        label: {
          'fr-FR': 'Instrument (< 4 ans) ou chant + Projet + Formation Musicale',
          'en-EN': 'Instrument (< 4 ans) ou chant + Projet + Formation Musicale'
        },
        value: '2024_instru_cycle1'
      },
      {
        label: {
          'fr-FR': 'Initiation multi-instrumentale',
          'en-EN': 'Initiation multi-instrumentale'
        },
        value: '2024_multi'
      },
      {
        label: {
          'fr-FR': 'Instrument (> 4 ans) ou chant + Atelier',
          'en-EN': 'Instrument (> 4 ans) ou chant + Atelier'
        },
        value: '2024_instru_cycle2'
      },
      {
        label: {
          'fr-FR': 'Hors cursus Instrument',
          'en-EN': 'Hors cursus Instrument'
        },
        value: '2024_horscursus_instru'
      },
      {
        label: {
          'fr-FR': 'Hors cursus Atelier Instrument',
          'en-EN': 'Hors cursus Atelier Instrument'
        },
        value: '2024_horscursus_atelier'
      },
      {
        label: {
          'fr-FR': 'Hors cursus Atelier batucada adultes',
          'en-EN': 'Hors cursus Atelier batucada adultes'
        },
        value: '2024_horscursus_percu'
      },
      {
        label: {
          'fr-FR': 'Hors cursus Ensemble vocal',
          'en-EN': 'Hors cursus Ensemble vocal'
        },
        value: '2024_horscursus_chorale'
      },
      {
        label: {
          'fr-FR': 'Hors cursus Chant individuel',
          'en-EN': 'Hors cursus Chant individuel'
        },
        value: '2024_horscursus_chant_individuel'
      },
      {
        label: {
          'fr-FR': 'Hors cursus Atelier vocal',
          'en-EN': 'Hors cursus Atelier vocal'
        },
        value: '2024_horscursus_atelier_vocal'
      },
      {
        label: {
          'fr-FR': 'Hors cursus "Boeuf sur le toit"',
          'en-EN': 'Hors cursus "Boeuf sur le toit"'
        },
        value: '2024_horscursus_boeuf'
      }
    ]
  },
  {
    label: {
      'fr-FR': 'Formation musicale',
      'en-EN': 'Formation musicale'
    },
    description: {
      'fr-FR': "Si applicable, choisir l'année de la formation musicale",
      'en-EN': "Si applicable, choisir l'année de la formation musicale"
    },
    name: 'teach_year',
    input: 'single-data',
    values: [
      {
        label: {
          'fr-FR': '1ère année',
          'en-EN': '1ère année'
        },
        value: 'first_year'
      },
      {
        label: {
          'fr-FR': '2ème année',
          'en-EN': '2ème année'
        },
        value: 'second'
      },
      {
        label: {
          'fr-FR': '3ème année',
          'en-EN': '3ème année'
        },
        value: 'third'
      },
      {
        label: {
          'fr-FR': '4ème année',
          'en-EN': '4ème année'
        },
        value: 'fourth'
      }
    ]
  },
  {
    label: {
      'fr-FR': 'Instrument',
      'en-EN': 'Instrument'
    },
    description: {
      'fr-FR': "Si applicable, choisir l'instrument",
      'en-EN': "Si applicable, choisir l'instrument"
    },
    name: 'instrument',
    input: 'single-data',
    values: [
      {
        label: {
          'fr-FR': 'Accordéon',
          'en-EN': 'Accordéon'
        },
        value: 'accordeon'
      },
      {
        label: {
          'fr-FR': 'Basse',
          'en-EN': 'Basse'
        },
        value: 'basse'
      },
      {
        label: {
          'fr-FR': 'Batterie',
          'en-EN': 'Batterie'
        },
        value: 'batterie'
      },
      {
        label: {
          'fr-FR': 'Clarinette',
          'en-EN': 'Clarinette'
        },
        value: 'clarinette'
      },
      {
        label: {
          'fr-FR': 'Contrebasse',
          'en-EN': 'Contrebasse'
        },
        value: 'contrebasse'
      },
      {
        label: {
          'fr-FR': 'Flûte',
          'en-EN': 'Flûte'
        },
        value: 'flute'
      },
      {
        label: {
          'fr-FR': 'Guitare classique',
          'en-EN': 'Guitare classique'
        },
        value: 'guitare_classique'
      },
      {
        label: {
          'fr-FR': 'Guitare électrique',
          'en-EN': 'Guitare électrique'
        },
        value: 'guitare_electrique'
      },
      {
        label: {
          'fr-FR': 'Piano',
          'en-EN': 'Piano'
        },
        value: 'piano'
      },
      {
        label: {
          'fr-FR': 'Saxophone',
          'en-EN': 'Saxophone'
        },
        value: 'saxophone'
      }
    ]
  },
  {
    label: {
      'fr-FR': 'Besoins particuliers (PAI, accompagnement, horaires privilégiés, fréquence...)',
      'en-EN': 'Besoins particuliers (PAI, accompagnement, horaires privilégiés, fréquence...)'
    },
    name: 'information',
    input: 'multiline-text'
  }
]

export const paymentFields = [
  {
    label: {
      'fr-FR': 'Information sur paiements',
      'en-EN': 'Information sur paiements'
    },
    description: {
      'fr-FR': '',
      'en-EN': ''
    },
    name: 'information',
    input: 'multiline-text'
  },
  {
    label: {
      'fr-FR': 'Moyen de paiement',
      'en-EN': 'Moyen de paiement'
    },
    description: {
      'fr-FR': '',
      'en-EN': ''
    },
    name: 'method',
    input: 'single-data',
    display: 'radio',
    values: [
      {
        label: {
          'fr-FR': 'Chèque(s)',
          'en-EN': 'Chèque(s)'
        },
        value: 'cheque',
        default: true
      },
      {
        label: {
          'fr-FR': 'Espèces',
          'en-EN': 'Espèces'
        },
        value: 'espece',
        default: true
      },
      {
        label: {
          'fr-FR': 'Hello Asso',
          'en-EN': 'Hello Asso'
        },
        value: 'hello_asso'
      },
      {
        label: {
          'fr-FR': 'Autre',
          'en-EN': 'Autre'
        },
        value: 'autre'
      }
    ],
    rules: {
      required: true
    }
  }
]

export const paymentStepFields = [
  {
    label: {
      'fr-FR': 'Information sur étape de paiement',
      'en-EN': 'Information sur étape de paiement'
    },
    description: {
      'fr-FR': '',
      'en-EN': ''
    },
    name: 'information',
    input: 'oneline-text'
  },
  {
    label: {
      'fr-FR': 'Moyen de paiement',
      'en-EN': 'Moyen de paiement'
    },
    description: {
      'fr-FR': '',
      'en-EN': ''
    },
    name: 'method',
    input: 'single-data',
    display: 'radio',
    values: [
      {
        label: {
          'fr-FR': 'Chèque(s)',
          'en-EN': 'Chèque(s)'
        },
        value: 'checkbook',
        default: true
      },
      {
        label: {
          'fr-FR': 'Espèces',
          'en-EN': 'Espèces'
        },
        value: 'cash',
        default: true
      },
      {
        label: {
          'fr-FR': 'Hello Asso',
          'en-EN': 'Hello Asso'
        },
        value: 'helloasso'
      },
      {
        label: {
          'fr-FR': 'Chèque vacance',
          'en-EN': 'Chèque vacance'
        },
        value: 'holiday check'
      },
      {
        label: {
          'fr-FR': 'Autre',
          'en-EN': 'Autre'
        },
        value: 'autre'
      }
    ],
    rules: {
      required: true
    }
  },
  {
    label: {
      'fr-FR': 'Montant du paiement',
      'en-EN': 'Montant du paiement'
    },
    description: {
      'fr-FR': '',
      'en-EN': ''
    },
    name: 'amount',
    input: 'number',
    rules: {
      required: true
    },
    attributes: {
      mode: 'currency',
      currency: 'EUR',
      locale: 'fr-FR'
    }
  },
  {
    label: {
      'fr-FR': "Date prévue d'encaissement",
      'en-EN': "Date prévue d'encaissement"
    },
    description: {
      'fr-FR': '',
      'en-EN': ''
    },
    name: 'planned_receipt_date',
    input: 'date'
  },
  {
    label: {
      'fr-FR': "Date d'encaissement",
      'en-EN': "Date d'encaissement"
    },
    description: {
      'fr-FR': '',
      'en-EN': ''
    },
    name: 'receipt_date',
    input: 'date'
  }
]

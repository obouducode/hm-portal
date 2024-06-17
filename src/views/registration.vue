<script setup lang="ts">
import { ref, computed } from 'vue'
import { type FormRecord } from '@/declarations';
import DataForm from '@/components/data-form.vue';
import PrimeButton from 'primevue/button'
import PrimeAccordion from 'primevue/accordion';
import PrimeAccordionTab from 'primevue/accordiontab';
import { generate } from '@pdfme/generator';
import HMPDF from '@/hm_inscription.json'

const stateForm = ref({
  currentStepIndex: 0,
  dataForm: {},
  errors: [],
  submitting: false,
  success: false,
  inprogress: true
})

const formRecord: FormRecord = {
  label: {
    'fr-FR': 'Formulaire inscription',
    'en-EN': 'Registration form',
  },
  description: {
    'fr-FR': '',
    'en-EN': '',
  },
  multisteps: true,
  steps: [{
    label: {
      'fr-FR': 'Accueil inscription',
      'en-EN': 'Accueil inscription',
    },
    description: {
      'fr-FR': '',
      'en-EN': '',
    },
  }, {
    label: {
      'fr-FR': 'Coordonnées de l\'adhérent',
      'en-EN': 'Coordonnées de l\'adhérent',
    },
    description: {
      'fr-FR': 'Merci de renseigner les informations de l\'adhérent ou de son-sa représentant-e légal-e',
      'en-EN': 'Merci de renseigner les informations de l\'adhérent ou de son-sa représentant-e légal-e',
    },
    property: 'membership',
    fields: [{
      label: {
        'fr-FR': 'NOM',
        'en-EN': 'Last name',
      },
      name: 'membership_lastname',
      input: 'oneline-text',
      rules: {
        required: true,
      }
    }, {
      label: {
        'fr-FR': 'Prénom',
        'en-EN': 'First name',
      },
      name: 'membership_firstname',
      input: 'oneline-text',
      rules: {
        required: true,
      }
    }, {
      label: {
        'fr-FR': 'Mail n°1 de contact',
        'en-EN': 'Mail n°1 de contact',
      },
      name: 'membership_email_1',
      input: 'oneline-text',
      type: 'email',
      rules: {
        required: true,
      }
    }, {
      label: {
        'fr-FR': 'Mail n°2 de contact',
        'en-EN': 'Mail n°2 de contact',
      },
      name: 'membership_email_2',
      input: 'oneline-text',
      type: 'email'
    }, {
      label: {
        'fr-FR': 'Tél n°1 de contact',
        'en-EN': 'Tél n°1 de contact',
      },
      name: 'membership_tel_1',
      input: 'oneline-text',
      type: 'tel',
      rules: {
        required: true,
      }
    }, {
      label: {
        'fr-FR': 'Tél n°2 de contact',
        'en-EN': 'Tél n°2 de contact',
      },
      name: 'membership_tel_2',
      input: 'oneline-text',
      type: 'tel'
    }, {
      label: {
        'fr-FR': 'Adresse',
        'en-EN': 'Adresse',
      },
      name: 'membership_',
      input: 'oneline-text',
    }, {
      label: {
        'fr-FR': 'Code postal',
        'en-EN': 'Code postal',
      },
      name: 'membership_zipcode',
      input: 'oneline-text',
      rules: {
        required: true,
      }
    }, {
      label: {
        'fr-FR': 'Ville',
        'en-EN': 'Ville',
      },
      name: 'membership_city',
      input: 'oneline-text',
      rules: {
        required: true,
      }
    }, {
      label: {
        'fr-FR': 'Quotient familial',
        'en-EN': 'Quotient familial',
      },
      description: {
        'fr-FR': 'Si tranche 1 à 3, merci de nous fournir l\'attestation de la CAF correspondante',
        'en-EN': 'Si tranche 1 à 3, merci de nous fournir l\'attestation de la CAF correspondante',
      },
      name: 'membership_family_quotient',
      input: 'single-data',
      display: 'radio',
      values: [{
        label: {
          'fr-FR': 'Tranche 1 (0 - 550 €)',
          'en-EN': 'Tranche 1 (0 - 550 €)',
        },
        value: 'tranche1'
      }, {
        label: {
          'fr-FR': 'Tranche 2 (551 - 800 €)',
          'en-EN': 'Tranche 2 (551 - 800 €)',
        },
        value: 'tranche2'
      }, {
        label: {
          'fr-FR': 'Tranche 3 (801 - 1050 €)',
          'en-EN': 'Tranche 3 (801 - 1050 €)',
        },
        value: 'tranche3'
      }, {
        label: {
          'fr-FR': 'Tranche 4 (> 1051 €)',
          'en-EN': 'Tranche 4 (> 1051 €)',
        },
        value: 'tranche4',
        default: true
      }],
      rules: {
        required: true,
      }
    }]
  }, {
    label: {
      'fr-FR': 'Activité(s)',
      'en-EN': 'Activité(s)',
    },
    description: {
      'fr-FR': 'Explications sur cette deuxième étape',
      'en-EN': 'Explications sur cette deuxième étape',
    },
    property: 'activity',
    isArray: true,
    fields: [{
      label: {
        'fr-FR': 'NOM',
        'en-EN': 'Last name',
      },
      name: 'activity_lastname',
      input: 'oneline-text',
      rules: {
        required: true,
      }
    }, {
      label: {
        'fr-FR': 'Prénom',
        'en-EN': 'First name',
      },
      name: 'activity_firstname',
      input: 'oneline-text',
      rules: {
        required: true,
      }
    }, {
      label: {
        'fr-FR': 'Date de naissance',
        'en-EN': 'Birthday',
      },
      name: 'activity_birthday',
      input: 'date',
      rules: {
        required: true,
      }
    }, {
      label: {
        'fr-FR': 'Besoins particuliers (PAI, accompagnement,...)',
        'en-EN': 'Besoins particuliers (PAI, accompagnement,...)',
      },
      name: 'activity_pai',
      input: 'multiline-text'
    }, {
      label: {
        'fr-FR': 'Cours',
        'en-EN': 'Cours',
      },
      name: 'activity_course',
      input: 'single-data',
      rules: {
        required: true
      },
      values: [{
        label: {
          'fr-FR': 'Eveil musical',
          'en-EN': 'Eveil musical',
        },
        value: 'eveil'
      }, {
        label: {
          'fr-FR': 'Instrument (< 4 ans) + Projet + Formation Musicale',
          'en-EN': 'Instrument (< 4 ans) + Projet + Formation Musicale',
        },
        value: 'instru_cycle1'
      }, {
        label: {
          'fr-FR': 'Initiation multi-instrumentale',
          'en-EN': 'Initiation multi-instrumentale',
        },
        value: 'multi'
      }, {
        label: {
          'fr-FR': 'Instrument (> 4 ans) + Atelier',
          'en-EN': 'Instrument (> 4 ans) + Atelier',
        },
        value: 'instru_cycle2',
      }, {
        label: {
          'fr-FR': 'Hors cursus Instrument',
          'en-EN': 'Hors cursus Instrument',
        },
        value: 'horscursus_instru',
      }, {
        label: {
          'fr-FR': 'Hors cursus Atelier Instrument',
          'en-EN': 'Hors cursus Atelier Instrument',
        },
        value: 'horscursus_atelier',
      }, {
        label: {
          'fr-FR': 'Hors cursus Percussions africaines',
          'en-EN': 'Hors cursus Percussions africaines',
        },
        value: 'horscursus_percu',
      }, {
        label: {
          'fr-FR': 'Hors cursus Ensemble vocal',
          'en-EN': 'Hors cursus Ensemble vocal',
        },
        value: 'horscursus_chorale',
      }, {
        label: {
          'fr-FR': 'Hors cursus Chant individuel',
          'en-EN': 'Hors cursus Chant individuel',
        },
        value: 'horscursus_chant_individuel',
      }, {
        label: {
          'fr-FR': 'Hors cursus Atelier vocal',
          'en-EN': 'Hors cursus Atelier vocal',
        },
        value: 'horscursus_atelier_vocal',
      }, {
        label: {
          'fr-FR': 'Hors cursus "Boeuf sur le toit"',
          'en-EN': 'Hors cursus "Boeuf sur le toit"',
        },
        value: 'horscursus_boeuf',
      }],
    }, {
      label: {
        'fr-FR': 'Instrument',
        'en-EN': 'Instrument',
      },
      description: {
        'fr-FR': 'Si applicable, choisir l\'instrument',
        'en-EN': 'Si applicable, choisir l\'instrument'
      },
      name: 'activity_instrument',
      input: 'single-data',
      values: [{
        label: {
          'fr-FR': 'Accordéon',
          'en-EN': 'Accordéon',
        },
        value: 'accordeon'
      }, {
        label: {
          'fr-FR': 'Basse',
          'en-EN': 'Basse',
        },
        value: 'basse'
      }, {
        label: {
          'fr-FR': 'Batterie',
          'en-EN': 'Batterie',
        },
        value: 'batterie'
      }, {
        label: {
          'fr-FR': 'Clarinette',
          'en-EN': 'Clarinette',
        },
        value: 'clarinette',
      }, {
        label: {
          'fr-FR': 'Contrebasse',
          'en-EN': 'Contrebasse',
        },
        value: 'contrebasse',
      }, {
        label: {
          'fr-FR': 'Flûte',
          'en-EN': 'Flûte',
        },
        value: 'flute',
      }, {
        label: {
          'fr-FR': 'Guitare classique',
          'en-EN': 'Guitare classique',
        },
        value: 'guitare_classique',
      }, {
        label: {
          'fr-FR': 'Guitare électrique',
          'en-EN': 'Guitare électrique',
        },
        value: 'guitare_electrique',
      }, {
        label: {
          'fr-FR': 'Piano',
          'en-EN': 'Piano',
        },
        value: 'piano',
      }, {
        label: {
          'fr-FR': 'Saxophone',
          'en-EN': 'Saxophone',
        },
        value: 'saxophone',
      }],
    }],
  }, {
    label: {
      'fr-FR': 'Récapitulatif',
      'en-EN': 'Récapitulatif',
    },
    description: {
      'fr-FR': '',
      'en-EN': '',
    },
    fields: [],
  }]
}

const currentStep = computed(() => formRecord.steps[stateForm.value.currentStepIndex])

function addActivity (propertyName) {
  if (!stateForm.value.dataForm[propertyName])
    stateForm.value.dataForm[propertyName] = []
  stateForm.value.dataForm[propertyName].push({})
}

async function generatePDF () {
  const pdf = await generate({
    template: HMPDF,
    inputs:  [{
      'membership_lastname': 'DARTIGUES',
      'membership_firstname': 'Mathieu',
      'membership_address': '3 Villeneuve',
      'membership_zipcode': '44130',
      'membership_city': 'Notre dame des landes',
      'membership_tel': '0909090909',
      'membership_email': 'mathieu@dartic.fr'
    }]
  })
  console.log(pdf);

  // Browser
  const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
  window.open(URL.createObjectURL(blob));

  // Node.js
  // fs.writeFileSync(path.join(__dirname, `test.pdf`), pdf);
}

</script>

<template>

  <ol class="items-center w-full space-y-4 sm:flex sm:space-x-8 sm:space-y-0 rtl:space-x-reverse mb-4 lg:mb-8 pb-2 lg:pb-4 px-2 lg:px-4 border-b">
    <li
      class="flex items-center  space-x-2.5 rtl:space-x-reverse cursor-pointer px-2"
      :class="{
        'text-blue-600 dark:text-blue-500 border-r border-l': stateForm.currentStepIndex === index
      }"
      v-for="(step, index) in formRecord.steps"
      @click="stateForm.currentStepIndex = index"
      :key="index"
    >
      <span
        class="flex items-center justify-center w-8 h-8 border border-blue-600 rounded-full shrink-0 dark:border-blue-500"
        :class="{
          'text-white bg-blue-600 dark:text-blue-500 border-r border-l': stateForm.currentStepIndex === index
        }"
      >
          {{ index + 1 }}
      </span>
      <span>
        <h3 class="font-medium leading-tight">
          {{ step.label['fr-FR'] }}
        </h3>
      </span>
    </li>
  </ol>

  <h2 class="text-xl text-center mb-4">
    {{ currentStep.label['fr-FR'] }}
  </h2>

  <p v-if="currentStep.description" class="px-2 lg:px-4 mb-4">
    {{ currentStep.description?.['fr-FR'] }}
  </p>

  <div class="px-2 lg:px-4 w-full flex flex-col justify-center">

    <template v-if="stateForm.currentStepIndex === 0">

      <p class="text-lg text-center my-4">
        Bienvenue sur le site d'inscription d'Héric Musique !
      </p>
      <p class="mb-4">
        Vous allez procéder au renseignement
        du formulaire d'inscription pour l'école de musique d'Héric,
        pour la saison 2024-2025.
      </p>
      <h2 class="text-xl font-bold mb-4">
        Tarifs 2024-2025
      </h2>
      <p class="mb-4">
        Vous pouvez retrouver les
        tarifs des différentes activités
        en téléchargeant
        <a href="tarifs_2024_2025.pdf" target="_blank" class="underline">
          le fichier disponible ici.
        </a>
        <br>
        Nous avons augmenté de modérément les tarifs cette année
        afin d'absorber une partie des évolutions à la hausse
        des charges de l'école de musique.
      </p>

      <p class="mb-4">
        À titre indicatif,
        voici le <strong>planning de la saison 2023-2024</strong> :
      </p>

      <ul>
        <li>
          <b>Chorale</b> : mercredi soir
        </li>
        <li>
          <b>Batterie</b> : mercredi
        </li>
        <li>
          <b>Guitare acoustique </b> : jeudi soir
        </li>
        <li>
          <b>Guitare électrique </b> : samedi après-midi
        </li>
        <li>
          <b>Accordéon</b> : mercredi après-midi
        </li>
        <li>
          <b>Formation musicale</b> : lundi soir et mardi soir
        </li>
        <li>
          <b>Piano</b> : lundi soir, mardi soir, mercredi et samedi matin
        </li>
        <li>
          <b>Éveil musical</b> : mercredi
        </li>
        <li>
          <b>Percussions africaines</b> : mercredi
        </li>
        <li>
          <b>Flûte, saxophone, clarinette</b> : mercredi après-midi
        </li>
      </ul>

      Les activités adultes sont planifiées directement avec les professeurs.
      <prime-button
        type="submit"
        class="border p-2 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 font-bold w-64 mx-auto my-8 block"
        @click="stateForm.currentStepIndex = 1"
      >
        Commencer l'inscription
      </prime-button>

    </template>

    <template v-else-if="stateForm.currentStepIndex === 1">
      <data-form
        :step="currentStep"
      />
    </template>
    <template v-else-if="stateForm.currentStepIndex === 2">
      <prime-button
        type="submit"
        class="border p-2 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 font-bold w-64 mx-auto my-8 block"
        @click="addActivity(currentStep.property)"
      >
        Créer une nouvelle inscription à une activité
      </prime-button>

      <prime-accordion :multiple="true" :activeIndex="[0]">

      <template
        v-for="(item, index) in stateForm.dataForm[currentStep.property]"
        :key="index"
      >
        <prime-accordion-tab>
         <template #header>
          <h3 class="text-lg">
            Activité n° {{ index + 1 }}
          </h3>
          </template>
          <data-form
            :step="currentStep"
            :display-submit-button="false"
          />
        </prime-accordion-tab>
      </template>

      </prime-accordion>

      <prime-button
        type="submit"
        class="border p-2 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 font-bold w-64 mx-auto my-8 block"
        @click="stateForm.currentStepIndex = 3"
      >
        Finaliser l'inscription
      </prime-button>


    </template>

    <template v-else>
      <p>
        Avant de nous envoyer votre inscription,
        merci de vérifier l'ensemble des données renseignées.
      </p>

      {{ stateForm.dataForm }}

      Adhésion

      Activités souscrites

      <br/>

      <prime-button
        type="submit"
        class="border p-2 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 font-bold w-64 mx-auto my-8 block"
        @click="generatePDF"
      >
        Générer PDF
      </prime-button>

      <h4 class="text-lg font-bold mb-2">Validation de votre inscription</h4>

      <p>
        Si vous pensez avoir finalisé votre inscription,
        vous pouvez procéder à sa validation.
      </p>
      <p>
        Cela va générer un email contenant
        votre demande d'inscription
        avec l'ensemble des renseignements précédents.
        Vous serez en copie du mail.
      </p>
      <p class="text-center text-lg font-bold my-4">ATTENTION !!!</p>
      <p>
        <strong>Votre inscription sera considérée comme définitive
          à la réception de votre paiement.
          Vous pouvez nous l'apporter lors de nos astreintes.
        </strong>
        <br>
        N'oubliez pas également de nous fournir votre attestation
        CAF concernant le quotient familial si vous êtes tranche 1 à 3.
      </p>
      <prime-button
        type="submit"
        class="border p-2 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 font-bold w-64 mx-auto my-8 block"
      >
        Valider mon inscription
      </prime-button>

    </template>

  </div>


</template>

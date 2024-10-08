<script setup lang="ts">
import { ref } from 'vue'
import PrimeMenu from 'primevue/menu'
const items = ref([
  {
    label: 'Revenir au site public',
    route: '/',
    icon: 'bi bi-house',
    class: 'font-medium'
  },
  {
    label: 'Adhésions',
    items: [
      {
        label: 'Listing',
        route: '/admin/membership/listing',
        icon: 'bi bi-table'
      },
      {
        label: 'Fiches détaillées',
        route: '/admin/membership/detail',
        icon: 'bi bi-person-vcard'
      }
    ]
  },
  {
    label: 'Inscriptions',
    items: [
      {
        label: 'Listing',
        route: '/admin/registration/listing',
        icon: 'bi bi-table'
      }
      // {
      //   label: 'Fiches détaillées',
      //   route: '/admin/registration/detail',
      //   icon: 'bi bi-person-vcard'
      // }
    ]
  }
  // {
  //   label: 'Le trésor',
  //   items: [
  //     {
  //       label: 'État des paiements',
  //       route: '/admin/payment/listing',
  //       icon: 'bi bi-currency-euro'
  //     }
  //     // {
  //     //   label: 'Adhésions à surveiller',
  //     //   route: '/admin/payment/listing',
  //     //   icon: 'bi bi-currency-euro'
  //     // }
  //   ]
  // }
  // {
  //   label: "L'équipe pédagogique",
  //   items: [
  //     {
  //       label: 'Professeurs',
  //       route: '/admin/learning/teacher',
  //       icon: 'bi bi-person-vcard'
  //     },
  //     {
  //       label: 'Agendas',
  //       route: '/admin/learning/calendar',
  //       icon: 'bi bi-calendar2-week'
  //     },
  //     {
  //       label: 'Matériel',
  //       route: '/admin/learning/stuff',
  //       icon: 'bi bi-wrench-adjustable-circle'
  //     }
  //   ]
  // },
  // {
  //   label: 'Gestion du compte',
  //   items: [
  //     {
  //       label: 'Déconnexion',
  //       route: '/logout',
  //       icon: 'bi bi-box-arrow-right'
  //     }
  //   ]
  // }
])
</script>
<template>
  <div class="flex h-full">
    <aside class="max-w-[20rem] w-[20rem] h-full bg-white border-r p-2 md:p-4">
      <header>
        <div class="text-2xl leading-8 text-color font-medium">Héric Musique</div>
        <div class="mt-1 leading-6 text-muted-color">Back office</div>
      </header>

      <prime-menu :model="items" class="mt-4">
        <template #item="{ item, props }">
          <router-link
            v-slot="{ href, navigate, isExactActive }"
            :to="item.route"
            custom
            :class="item.class"
          >
            <a
              v-ripple
              :href="href"
              v-bind="props.action"
              @click="navigate"
              :class="{
                'border-b bg-slate-200': isExactActive
              }"
            >
              <span :class="item.icon" />
              <span class="ml-2">{{ item.label }}</span>
            </a>
          </router-link>
        </template>
      </prime-menu>
    </aside>
    <router-view class="grow p-2 md:p-4 !pb-0" />
  </div>
</template>

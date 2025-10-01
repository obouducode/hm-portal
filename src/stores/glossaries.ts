import { ref } from 'vue'
import { defineStore } from 'pinia'
import { lckWorkspaceHM } from '@/sdk/lckWorkspaceHM'
import type { Paginated } from '@feathersjs/feathers'

/**
 * Glossary store,
 * useful to keep in store items used in several forms
 */
export const useStoreGlossary = defineStore('glossary', () => {
  const glossaryState = ref({
    loading: false,
    error: null as null | Error,
    seasons: {} as Record<string, MsSeason>,
    courses: {} as Record<string, MsActivityCourse>,
    instruments: {} as Record<string, MsActivityInstrument>
  })

  async function fetch() {
    glossaryState.value.loading = true
    try {
      const seasonsResponse = (await lckWorkspaceHM.glossaries.season.record.find({
        query: {
          $limit: 100
        }
      })) as Paginated<MsSeason>
      const coursesResponse = (await lckWorkspaceHM.glossaries.activity_course.record.find({
        query: {
          $limit: 100
        }
      })) as Paginated<MsActivityCourse>
      const instrumentsResponse = (await lckWorkspaceHM.glossaries.activity_instrument.record.find({
        query: {
          $limit: 100
        }
      })) as Paginated<MsActivityInstrument>
      glossaryState.value.seasons = seasonsResponse.data.reduce(
        (acc, currentSeason) => {
          acc[currentSeason.id] = currentSeason
          return acc
        },
        {} as Record<string, MsSeason>
      )
      glossaryState.value.courses = coursesResponse.data.reduce(
        (acc, currentCourse) => {
          acc[currentCourse.id] = currentCourse
          return acc
        },
        {} as Record<string, MsActivityCourse>
      )
      glossaryState.value.instruments = instrumentsResponse.data.reduce(
        (acc, currentInstrument) => {
          acc[currentInstrument.id] = currentInstrument
          return acc
        },
        {} as Record<string, MsActivityInstrument>
      )
      console.log(glossaryState.value)
      glossaryState.value.error = null
    } catch (error) {
      console.error(error)
      glossaryState.value.error = error as Error
    }
    glossaryState.value.loading = false
  }

  return { glossaryState, fetch }
})

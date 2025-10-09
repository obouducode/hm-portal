import { feathers } from '@feathersjs/feathers'
import rest from '@feathersjs/rest-client'
import auth from '@feathersjs/authentication-client'
import { router } from '@/router'

// import { manageExpiredToken } from './hooks'

export const lckClient = feathers()

// Connect to a different URL
const restClient = rest(LCK_SETTINGS.API_URL)

// Configure an AJAX library (see below) with that client
lckClient.configure(restClient.fetch(window.fetch.bind(window)))
lckClient.configure(
  auth({
    storageKey: LCK_SETTINGS.LOCALSTORAGE_KEY_AUTH_TOKEN,
    path: '/auth/authentication'
  })
)

lckClient.hooks({
  error: function manageExpiredToken(context: feathers.HookContext) {
    if (context.error.code === 401 && context.error.data?.name === 'TokenExpiredError') {
      router.push('/')
    }
    if (context.error.code === 401 && context.error.name === 'NotAuthenticated') {
      router.push('/')
    }
    return context
  },
})

// Add the hooks to the client
// lckClient.hooks({
//   error: manageExpiredToken,
// })
// Connect to the `http://feathers-api.com/messages` service
// const messages = lckClient.service('messages')

// lckClient.service('messages').create({
//   text: 'A new message'
// })

export const headers = {
  'x-lck-group': 'fbb8c7e7-3f90-4c19-a490-fda63c3740a5'
}

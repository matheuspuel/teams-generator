// import { StackActions } from '@react-navigation/native'
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
// import { isSome } from 'fp-ts/lib/Option'
// import { serverUrl } from 'src/constants'
// import auth from 'src/features/auth/api'
// import core from 'src/features/core/api'
// import { getPreviewServerUrl } from 'src/features/core/slices/preview'
// import realtor from 'src/features/realtor/api'
// import { AppDispatch } from 'src/redux/store'
// import { navigationRef } from 'src/routes/ref'
// import { envName } from 'src/utils/Env'
// import { RootState } from './store'
// import { combineEndpoints } from './utils'

// const customFetchBaseQuery: typeof fetchBaseQuery =
//   options => async (args, api, extraOptions) => {
//     const currentServerUrl =
//       envName === 'production'
//         ? serverUrl
//         : getPreviewServerUrl(api.getState() as RootState)
//     const baseUrl = currentServerUrl + (options?.baseUrl || '')
//     const response = await fetchBaseQuery({ ...options, baseUrl })(
//       args,
//       api,
//       extraOptions,
//     )
//     const logoffUrl = '/auth/account/logoff'
//     const requestUrl = typeof args === 'string' ? args : args.url
//     if (response.error?.status === 401 && requestUrl !== logoffUrl) {
//       await api.dispatch(logout())
//     }
//     return response
//   }

// export type TagTypes = typeof tagTypes[number]
// const tagTypes = [] as const

// export const api = createApi({
//   baseQuery: customFetchBaseQuery({
//     baseUrl: '/api/v1',
//     prepareHeaders: (headers, { getState }) => {
//       const token = (getState() as RootState).auth.token
//       if (isSome(token)) headers.set('authorization', `Bearer ${token.value}`)
//       return headers
//     },
//   }),
//   tagTypes,
//   endpoints: combineEndpoints({
//     ...core,
//     ...auth,
//     ...realtor,
//   }),
// })

// // ACTIONS

// export const logout =
//   () => async (dispatch: AppDispatch, getState: () => RootState) => {
//     if (navigationRef.isReady()) {
//       if (navigationRef.canGoBack()) {
//         navigationRef.dispatch(StackActions.popToTop())
//       }
//       navigationRef.dispatch(StackActions.replace('Auth/AuthHome'))
//     }
//     if (isSome(getState().auth.token)) {
//       await dispatch(api.endpoints.logoff.initiate())
//     }
//   }

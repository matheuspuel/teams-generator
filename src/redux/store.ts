import { combineReducers, configureStore } from '@reduxjs/toolkit'
import throttle from 'lodash.throttle'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import auth from 'src/features/auth/slices'
import core from 'src/features/core/slices'
import {
  hydrateReducer,
  hydrateStore,
  saveState,
} from 'src/features/core/slices/hydrated'
import realtor from 'src/features/realtor/slices'
import { api } from './api'
import { getCache, setCache } from './cache'

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  core,
  auth,
  realtor,
})

const reducer: typeof rootReducer = (state, action) =>
  hydrateReducer(rootReducer(state, action), action)

const store = configureStore({
  reducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(api.middleware),
  preloadedState: __DEV__ ? getCache() : undefined,
})
if (__DEV__) store.subscribe(() => setCache(store.getState()))
export default store

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

store.subscribe(throttle(() => store.dispatch(saveState()), 1000))
// store.dispatch(listenToAppState())
store.dispatch(hydrateStore()).then(() => {
  // store.dispatch(listenToConnectivity())
})

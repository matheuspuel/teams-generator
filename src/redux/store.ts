import { combineReducers, configureStore } from '@reduxjs/toolkit'
import throttle from 'lodash.throttle'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import {
  hydrateReducer,
  makeHydrateAction,
  saveState,
} from 'src/redux/slices/hydrated'
import { pipe, T } from 'src/utils/fp-ts'
import { getCache, setCache } from './cache'
import groups from './slices/groups'
import hydrated from './slices/hydrated'
import parameters from './slices/parameters'
import preview from './slices/preview'
// import { api } from './api'

const rootReducer = combineReducers({
  // [api.reducerPath]: api.reducer,
  preview,
  hydrated,
  groups,
  parameters,
})

const reducer: typeof rootReducer = (state, action) =>
  hydrateReducer(rootReducer(state, action), action)

const store = configureStore({
  reducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  // .concat(api.middleware),
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
pipe(
  makeHydrateAction,
  T.chainFirstIOK(a => () => store.dispatch(a)),
  // T.chainFirstIOK(() => () => listenToConnetivity()),
)()

import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { $, T } from 'fp'
import throttle from 'lodash.throttle'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import {
  hydrateReducer,
  makeHydrateAction,
  saveState,
} from 'src/redux/slices/hydrated'
import groups from './slices/groups'
import hydrated from './slices/hydrated'
import parameters from './slices/parameters'
import preview from './slices/preview'

const rootReducer = combineReducers({
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
})
export default store

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// eslint-disable-next-line functional/no-expression-statement
store.subscribe(throttle(() => void store.dispatch(saveState()), 1000))

// eslint-disable-next-line functional/no-expression-statement
void $(
  makeHydrateAction,
  T.chainFirstIOK(a => () => store.dispatch(a)),
)()

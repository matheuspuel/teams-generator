import {
  AnyAction,
  createAction,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit'
import { constant, pipe } from 'fp-ts/lib/function'
import { some } from 'fp-ts/lib/Option'
import { AppDispatch, RootState } from 'src/redux/store'
import { PreviewDataStorage } from 'src/storage'
import { envName } from 'src/utils/Env'
import { O, T } from 'src/utils/fp-ts'

const hydratedSlice = createSlice({
  name: 'hydrated',
  initialState: false,
  reducers: {
    set: (s, a: PayloadAction<boolean>) => a.payload,
  },
})

export default hydratedSlice.reducer

export const hydrateReducer = (
  state: RootState,
  action: AnyAction,
): RootState => {
  if (!hydrateAction.match(action)) return state
  const p = action.payload
  return {
    ...state,
    hydrated: true,
    preview: p.preview,
  }
}

// SELECTORS

export const getHydrated = (s: RootState) => s.hydrated

// ACTIONS

export const saveState =
  () => async (dispatch: AppDispatch, getState: () => RootState) =>
    pipe(
      T.fromIO(getState),
      T.chainFirst(s => PreviewDataStorage.set(s.preview)),
    )()

const hydrateAction = createAction<HydrateData>('HYDRATE')

export const hydrateStore = () => async (dispatch: AppDispatch) => {
  dispatch(hydrateAction(await getHydrateData()))
}

type HydrateData = Awaited<ReturnType<typeof getHydrateData>>
const getHydrateData = async () => {
  const preview = pipe(
    envName === 'production'
      ? some({ serverUrl: '' })
      : await PreviewDataStorage.get(),
    O.getOrElse(constant({ serverUrl: '' })),
  )
  return {
    preview,
  }
}

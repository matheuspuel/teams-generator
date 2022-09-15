import {
  AnyAction,
  createAction,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit'
import { constant, pipe } from 'fp-ts/lib/function'
import { some } from 'fp-ts/lib/Option'
import { AuthTokenStorage } from 'src/features/auth/storage'
import { RealtorDataStorage } from 'src/features/realtor/storage'
import { envName } from 'src/utils/Env'
import { O, T } from 'src/utils/fp-ts'
import { AppDispatch, RootState } from '../../../redux/store'
import { PreviewDataStorage } from '../storage'

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
    core: { ...state.core, hydrated: true, preview: p.core.preview },
    auth: { ...state.auth, token: p.auth.token },
    realtor: { ...state.realtor, realtor: p.realtor.realtor },
  }
}

// SELECTORS

export const getHydrated = (s: RootState) => s.core.hydrated

// ACTIONS

export const saveState =
  () => async (dispatch: AppDispatch, getState: () => RootState) =>
    pipe(
      T.fromIO(getState),
      T.chainFirst(s => PreviewDataStorage.set(s.core.preview)),
      T.chainFirst(s => AuthTokenStorage.setOrRemove(s.auth.token)),
      T.chainFirst(s => RealtorDataStorage.setOrRemove(s.realtor.realtor)),
    )()

const hydrateAction = createAction<HydrateData>('HYDRATE')

export const hydrateStore = () => async (dispatch: AppDispatch) => {
  dispatch(hydrateAction(await getHydrateData()))
}

type HydrateData = Awaited<ReturnType<typeof getHydrateData>>
const getHydrateData = async () => {
  const token = await AuthTokenStorage.get()
  const realtor = await RealtorDataStorage.get()
  const preview = pipe(
    envName === 'production'
      ? some({ serverUrl: '' })
      : await PreviewDataStorage.get(),
    O.getOrElse(constant({ serverUrl: '' })),
  )
  return {
    auth: { token },
    realtor: { realtor },
    core: { preview },
  }
}

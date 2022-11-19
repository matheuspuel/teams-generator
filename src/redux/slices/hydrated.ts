import {
  AnyAction,
  createAction,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit'
import { constant, pipe } from 'fp-ts/lib/function'
import { defaultParameters } from 'src/datatypes/Parameters'
import { AppDispatch, RootState } from 'src/redux/store'
import {
  GroupsStorage,
  ParametersStorage,
  PreviewDataStorage,
} from 'src/storage'
import { envName } from 'src/utils/Env'
import { O, T, TO } from 'src/utils/fp-ts'

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
    groups: p.groups,
    parameters: p.parameters,
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
      T.chainFirst(s => GroupsStorage.set(s.groups)),
      T.chainFirst(s => ParametersStorage.set(s.parameters)),
    )()

const getHydrateData = pipe(
  T.Do,
  T.apS(
    'preview',
    pipe(
      envName === 'production' ? TO.none : PreviewDataStorage.get,
      T.map(O.getOrElse(constant({ serverUrl: '' }))),
    ),
  ),
  T.apS('groups', pipe(GroupsStorage.get, T.map(O.getOrElseW(constant({}))))),
  T.apS(
    'parameters',
    pipe(
      ParametersStorage.get,
      T.map(O.getOrElseW(constant(defaultParameters))),
    ),
  ),
)

type HydrateData = Awaited<ReturnType<typeof getHydrateData>>

const hydrateAction = createAction<HydrateData>('HYDRATE')

export const makeHydrateAction = pipe(getHydrateData, T.map(hydrateAction))

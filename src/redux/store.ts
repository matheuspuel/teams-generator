import { defaultParameters, Parameters } from 'src/datatypes/Parameters'
import { makeStore, Store } from 'src/utils/store'
import { selectorHook, SelectorHook } from 'src/utils/store/react/selector'
import { emptyGroups, GroupsState } from './slices/groups'

export type RootState = {
  core: { isLoaded: boolean }
  parameters: Parameters
  groups: GroupsState
}

export type AppStore = Store<RootState>

export type AppStoreEnv = { store: AppStore }

export const useAppSelector: SelectorHook<RootState> = selectorHook

export const store: AppStore = makeStore<RootState>({
  core: { isLoaded: false },
  groups: emptyGroups,
  parameters: defaultParameters,
})

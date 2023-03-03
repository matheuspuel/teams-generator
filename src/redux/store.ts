import { O, Option } from 'fp'
import { defaultParameters, Parameters } from 'src/datatypes/Parameters'
import { Id } from 'src/utils/Entity'
import { makeStore, Store } from 'src/utils/store'
import { selectorHook, SelectorHook } from 'src/utils/store/react/selector'
import { emptyGroups, GroupsState } from './slices/groups'
import { blankPlayerForm, PlayerForm } from './slices/playerForm'

export type RootState = {
  core: { isLoaded: boolean }
  parameters: Parameters
  groups: GroupsState
  playerForm: PlayerForm
  ui: {
    selectedGroupId: Option<Id>
    selectedPlayerId: Option<Id>
    modalUpsertGroup: Option<{ id: Option<Id>; name: string }>
    modalDeleteGroup: Option<{ id: Id }>
    modalParameters: boolean
  }
}

export type AppStore = Store<RootState>

export type AppStoreEnv = { store: AppStore }

export const useAppSelector: SelectorHook<RootState> = selectorHook

export const store: AppStore = makeStore<RootState>({
  core: { isLoaded: false },
  groups: emptyGroups,
  parameters: defaultParameters,
  playerForm: blankPlayerForm,
  ui: {
    selectedGroupId: O.none,
    selectedPlayerId: O.none,
    modalUpsertGroup: O.none,
    modalDeleteGroup: O.none,
    modalParameters: false,
  },
})

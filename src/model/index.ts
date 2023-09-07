import { O, Option } from 'fp'
import { GroupOrder, Parameters } from 'src/datatypes'
import { GroupsState, emptyGroups } from 'src/slices/groups'
import { PlayerForm, blankPlayerForm } from 'src/slices/playerForm'
import { GeneratedResult } from 'src/slices/result'
import { Route, initialRoute } from 'src/slices/routes'
import { Id } from 'src/utils/Entity'

export type RootState = {
  core: { isLoaded: boolean }
  alert: Option<{ title: string; message: string; type: 'error' | 'success' }>
  parameters: Parameters
  groups: GroupsState
  playerForm: PlayerForm
  result: Option<GeneratedResult>
  groupOrder: GroupOrder
  ui: {
    selectedGroupId: Option<Id>
    selectedPlayerId: Option<Id>
    modalUpsertGroup: Option<{ id: Option<Id>; name: string }>
    modalDeleteGroup: Option<{ id: Id }>
    modalParameters: boolean
    modalSortGroup: Option<null>
    homeMenu: boolean
    groupMenu: boolean
  }
  route: Route
}

export const initialAppState: RootState = {
  core: { isLoaded: false },
  alert: O.none(),
  groups: emptyGroups,
  parameters: Parameters.initial,
  playerForm: blankPlayerForm,
  result: O.none(),
  groupOrder: GroupOrder.initial,
  ui: {
    selectedGroupId: O.none(),
    selectedPlayerId: O.none(),
    modalUpsertGroup: O.none(),
    modalDeleteGroup: O.none(),
    modalParameters: false,
    modalSortGroup: O.none(),
    homeMenu: false,
    groupMenu: false,
  },
  route: initialRoute,
}

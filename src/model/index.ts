import { O, Option } from 'fp'
import { Parameters } from 'src/datatypes'
import { GroupsState, emptyGroups } from 'src/slices/groups'
import { PlayerForm, blankPlayerForm } from 'src/slices/playerForm'
import { GeneratedResult } from 'src/slices/result'
import { Route, initialRoute } from 'src/slices/routes'
import { Id } from 'src/utils/Entity'

export type RootState = {
  core: { isLoaded: boolean }
  parameters: Parameters
  groups: GroupsState
  playerForm: PlayerForm
  result: Option<GeneratedResult>
  ui: {
    selectedGroupId: Option<Id>
    selectedPlayerId: Option<Id>
    modalUpsertGroup: Option<{ id: Option<Id>; name: string }>
    modalDeleteGroup: Option<{ id: Id }>
    modalParameters: boolean
  }
  route: Route
}

export const initialAppState = {
  core: { isLoaded: false },
  groups: emptyGroups,
  parameters: Parameters.initial,
  playerForm: blankPlayerForm,
  result: O.none,
  ui: {
    selectedGroupId: O.none,
    selectedPlayerId: O.none,
    modalUpsertGroup: O.none,
    modalDeleteGroup: O.none,
    modalParameters: false,
  },
  route: initialRoute,
}

import { O, Option } from 'fp'
import { defaultParameters, Parameters } from 'src/datatypes/Parameters'
import { emptyGroups, GroupsState } from 'src/slices/groups'
import { blankPlayerForm, PlayerForm } from 'src/slices/playerForm'
import { GeneratedResult } from 'src/slices/result'
import { initialRoute, Route } from 'src/slices/routes'
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

export const initialStoreState = {
  core: { isLoaded: false },
  groups: emptyGroups,
  parameters: defaultParameters,
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

import { A, O, Option } from 'fp'
import { GroupOrder, Parameters } from 'src/datatypes'
import { Modality } from 'src/datatypes/Modality'
import { GroupsState, emptyGroups } from 'src/slices/groups'
import { ModalityForm, initialModalityForm } from 'src/slices/modalityForm'
import { PlayerForm } from 'src/slices/playerForm'
import { GeneratedResult } from 'src/slices/result'
import { Route } from 'src/slices/routes'
import { Id } from 'src/utils/Entity'

export type RootState = {
  core: { isLoaded: boolean }
  alert: Option<{ title: string; message: string; type: 'error' | 'success' }>
  parameters: Parameters
  groupOrder: GroupOrder
  groups: GroupsState
  modalities: ReadonlyArray<Modality>
  result: Option<GeneratedResult>
  playerForm: PlayerForm
  groupForm: { id: Option<Id>; name: string; modalityId: Option<Id> }
  modalityForm: ModalityForm
  ui: {
    selectedGroupId: Option<Id>
    selectedPlayerId: Option<Id>
    modalDeleteGroup: boolean
    modalDeleteModality: boolean
    modalParameters: boolean
    modalSortGroup: boolean
    homeMenu: boolean
    groupMenu: boolean
  }
  route: ReadonlyArray<Route>
}

export const initialAppState: RootState = {
  core: { isLoaded: false },
  alert: O.none(),
  groups: emptyGroups,
  modalities: A.empty(),
  parameters: Parameters.initial,
  playerForm: { name: '', positionId: Id('0'), rating: 5 },
  groupForm: { id: O.none(), name: '', modalityId: O.none() },
  modalityForm: initialModalityForm,
  result: O.none(),
  groupOrder: GroupOrder.initial,
  ui: {
    selectedGroupId: O.none(),
    selectedPlayerId: O.none(),
    modalDeleteGroup: false,
    modalDeleteModality: false,
    modalParameters: false,
    modalSortGroup: false,
    homeMenu: false,
    groupMenu: false,
  },
  route: [Route('Groups')()],
}

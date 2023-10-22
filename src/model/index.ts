import { A, O, Option } from 'fp'
import { GroupOrder, Modality, Parameters } from 'src/datatypes'
import { CustomModality, soccer } from 'src/datatypes/Modality'
import { Abbreviation } from 'src/datatypes/Position'
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
  customModalities: ReadonlyArray<CustomModality>
  result: Option<GeneratedResult>
  playerForm: PlayerForm
  groupForm: {
    id: Option<Id>
    name: string
    modality: Modality.Reference
  }
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
  customModalities: A.empty(),
  parameters: Parameters.initial,
  playerForm: { name: '', positionAbbreviation: Abbreviation('a'), rating: 5 },
  groupForm: { id: O.none(), name: '', modality: soccer },
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

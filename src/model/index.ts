import { Array, Option } from 'effect'
import { NonEmptyReadonlyArray } from 'effect/Array'
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
  alert: Option.Option<{
    title: string
    message: string
    type: 'error' | 'success'
  }>
  parameters: Parameters
  groupOrder: GroupOrder
  preferences: { isRatingVisible: boolean }
  groups: GroupsState
  customModalities: ReadonlyArray<CustomModality>
  result: Option.Option<GeneratedResult>
  playerForm: PlayerForm
  groupForm: {
    id: Option.Option<Id>
    name: string
    modality: Modality.Reference
  }
  modalityForm: ModalityForm
  ui: {
    selectedGroupId: Option.Option<Id>
    selectedPlayerId: Option.Option<Id>
  }
  route: NonEmptyReadonlyArray<Route>
}

export const initialAppState: RootState = {
  core: { isLoaded: false },
  alert: Option.none(),
  groups: emptyGroups,
  customModalities: Array.empty(),
  parameters: Parameters.initial,
  playerForm: { name: '', positionAbbreviation: Abbreviation('a'), rating: 5 },
  groupForm: { id: Option.none(), name: '', modality: soccer },
  modalityForm: initialModalityForm,
  result: Option.none(),
  groupOrder: GroupOrder.initial,
  preferences: { isRatingVisible: true },
  ui: {
    selectedGroupId: Option.none(),
    selectedPlayerId: Option.none(),
  },
  route: [Route.Groups()],
}

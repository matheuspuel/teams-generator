import { Array, Fiber } from 'effect'
import { GroupOrder, Modality, Parameters } from 'src/datatypes'
import { CustomModality, soccer } from 'src/datatypes/Modality'
import { Abbreviation } from 'src/datatypes/Position'
import { GroupsState, emptyGroups } from 'src/slices/groups'
import { ModalityForm, initialModalityForm } from 'src/slices/modalityForm'
import { PlayerForm } from 'src/slices/playerForm'
import { GeneratedResult } from 'src/slices/result'
import { Id } from 'src/utils/Entity'

export type RootState = {
  core: { isLoaded: boolean }
  alert: {
    title: string
    message: string
    type: 'error' | 'success'
  } | null
  parameters: Parameters
  groupOrder: GroupOrder
  preferences: { isRatingVisible: boolean }
  groups: GroupsState
  customModalities: ReadonlyArray<CustomModality>
  result: Fiber.Fiber<GeneratedResult>
  playerForm: PlayerForm
  groupForm: {
    id: Id | null
    name: string
    modality: Modality.Reference
  }
  modalityForm: ModalityForm
}

export const initialAppState: RootState = {
  core: { isLoaded: false },
  alert: null,
  groups: emptyGroups,
  customModalities: Array.empty(),
  parameters: Parameters.initial,
  playerForm: {
    name: '',
    positionAbbreviation: Abbreviation.make('a'),
    rating: 5,
  },
  groupForm: { id: null, name: '', modality: soccer },
  modalityForm: initialModalityForm,
  result: Fiber.never,
  groupOrder: GroupOrder.initial,
  preferences: { isRatingVisible: true },
}

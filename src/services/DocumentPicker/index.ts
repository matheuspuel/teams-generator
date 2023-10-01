import * as Context from 'effect/Context'
import { NonEmptyReadonlyArray } from 'effect/ReadonlyArray'
import { Data, Effect, F } from 'src/utils/fp'

export type DocumentPicker = {
  getDocument: (args?: {
    type?: NonEmptyReadonlyArray<string>
  }) => Effect<
    never,
    DocumentPickerError | CanceledOperationError,
    { uri: string }
  >
}

export const DocumentPickerEnv = Context.Tag<DocumentPicker>()

export const DocumentPicker = F.serviceFunctions(DocumentPickerEnv)

export interface DocumentPickerError extends Data.Case {
  _tag: 'DocumentPickerError'
  error: Error
}
export const DocumentPickerError = Data.tagged<DocumentPickerError>(
  'DocumentPickerError',
)

export interface CanceledOperationError extends Data.Case {
  _tag: 'CanceledOperationError'
}
export const CanceledOperationError = Data.tagged<CanceledOperationError>(
  'CanceledOperationError',
)

import * as Context from 'effect/Context'
import { NonEmptyReadonlyArray } from 'effect/ReadonlyArray'
import { Data, Effect, F } from 'src/utils/fp'

export type DocumentPicker = {
  getDocument: (args?: {
    type?: NonEmptyReadonlyArray<string>
  }) => Effect<{ uri: string }, DocumentPickerError | CanceledOperationError>
}

export class DocumentPickerEnv extends Context.Tag('DocumentPicker')<
  DocumentPickerEnv,
  DocumentPicker
>() {}

export const DocumentPicker = F.serviceFunctions(DocumentPickerEnv)

export class DocumentPickerError extends Data.TaggedError(
  'DocumentPickerError',
)<{ error: Error }> {}

export class CanceledOperationError extends Data.TaggedError(
  'CanceledOperationError',
) {}

import { Data, Effect } from 'effect'
import * as Context from 'effect/Context'
import { NonEmptyReadonlyArray } from 'effect/ReadonlyArray'

export type DocumentPicker = {
  getDocument: (args?: {
    type?: NonEmptyReadonlyArray<string>
  }) => Effect.Effect<
    { uri: string },
    DocumentPickerError | CanceledOperationError
  >
}

export class DocumentPickerEnv extends Context.Tag('DocumentPicker')<
  DocumentPickerEnv,
  DocumentPicker
>() {}

export const DocumentPicker = Effect.serviceFunctions(DocumentPickerEnv)

export class DocumentPickerError extends Data.TaggedError(
  'DocumentPickerError',
)<{ error: Error }> {}

export class CanceledOperationError extends Data.TaggedError(
  'CanceledOperationError',
) {}

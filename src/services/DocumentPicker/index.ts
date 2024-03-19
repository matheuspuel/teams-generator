import { Context, Data, Effect } from 'effect'
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

import { Data, Effect } from 'effect'
import { NonEmptyReadonlyArray } from 'effect/Array'

export type DocumentPickerImplementation = {
  getDocument: (args?: {
    type?: NonEmptyReadonlyArray<string>
  }) => Effect.Effect<
    { uri: string },
    DocumentPickerError | CanceledOperationError
  >
}

export class DocumentPicker extends Effect.Tag('DocumentPicker')<
  DocumentPicker,
  DocumentPickerImplementation
>() {}

export class DocumentPickerError extends Data.TaggedError(
  'DocumentPickerError',
)<{ error: Error }> {}

export class CanceledOperationError extends Data.TaggedError(
  'CanceledOperationError',
) {}

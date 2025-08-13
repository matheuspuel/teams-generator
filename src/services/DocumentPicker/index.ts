import { Data, Effect } from 'effect'
import { NonEmptyArray } from 'effect/Array'

export class DocumentPicker extends Effect.Tag('DocumentPicker')<
  DocumentPicker,
  {
    getDocument: (args?: {
      type?: NonEmptyArray<string>
    }) => Effect.Effect<
      { uri: string },
      DocumentPickerError | CanceledOperationError
    >
  }
>() {}

export class DocumentPickerError extends Data.TaggedError(
  'DocumentPickerError',
)<{ cause: Error }> {}

export class CanceledOperationError extends Data.TaggedError(
  'CanceledOperationError',
) {}

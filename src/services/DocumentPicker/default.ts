import { Array, Effect, Layer, pipe } from 'effect'
import * as ExpoDocumentPicker from 'expo-document-picker'
import { enforceErrorInstance } from 'src/utils/Error'
import { DeepMutable } from 'src/utils/types'
import { CanceledOperationError, DocumentPicker, DocumentPickerError } from '.'

export const DocumentPickerLive = DocumentPicker.context({
  getDocument: args =>
    pipe(
      Effect.tryPromise({
        try: () =>
          ExpoDocumentPicker.getDocumentAsync({
            type: args?.type
              ? (args.type as DeepMutable<typeof args.type>)
              : undefined,
            multiple: false,
            copyToCacheDirectory: false,
          }),
        catch: e => new DocumentPickerError({ cause: enforceErrorInstance(e) }),
      }),
      Effect.flatMap(r =>
        r.canceled
          ? Effect.fail(new CanceledOperationError())
          : Effect.succeed(r),
      ),
      Effect.map(r => r.assets),
      Effect.flatMap(as =>
        Array.head(as).pipe(
          Effect.orElseFail(
            () =>
              new DocumentPickerError({
                cause: new Error('No assets received'),
              }),
          ),
        ),
      ),
    ),
}).pipe(Layer.succeedContext)

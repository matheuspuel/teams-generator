import { Effect, Layer, ReadonlyArray, pipe } from 'effect'
import * as ExpoDocumentPicker from 'expo-document-picker'
import { enforceErrorInstance } from 'src/utils/Error'
import { DeepMutable } from 'src/utils/types'
import {
  CanceledOperationError,
  DocumentPickerEnv,
  DocumentPickerError,
} from '.'

export const DocumentPickerLive = DocumentPickerEnv.context({
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
        catch: e => new DocumentPickerError({ error: enforceErrorInstance(e) }),
      }),
      Effect.flatMap(r =>
        r.canceled
          ? Effect.fail(new CanceledOperationError())
          : Effect.succeed(r),
      ),
      Effect.map(r => r.assets),
      Effect.flatMap(as =>
        ReadonlyArray.head(as).pipe(
          Effect.orElseFail(
            () =>
              new DocumentPickerError({
                error: new Error('No assets received'),
              }),
          ),
        ),
      ),
    ),
}).pipe(Layer.succeedContext)

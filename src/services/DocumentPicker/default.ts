import * as ExpoDocumentPicker from 'expo-document-picker'
import { A, F, Layer, pipe } from 'fp'
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
      F.tryPromise({
        try: () =>
          ExpoDocumentPicker.getDocumentAsync({
            type: args?.type
              ? (args.type as DeepMutable<typeof args.type>)
              : undefined,
            multiple: false,
            copyToCacheDirectory: false,
          }),
        catch: e => DocumentPickerError({ error: enforceErrorInstance(e) }),
      }),
      F.flatMap(r =>
        r.canceled ? F.fail(CanceledOperationError()) : F.succeed(r),
      ),
      F.map(r => r.assets),
      F.flatMap(as =>
        A.head(as).pipe(
          F.orElseFail(() =>
            DocumentPickerError({ error: new Error('No assets received') }),
          ),
        ),
      ),
    ),
}).pipe(Layer.succeedContext)

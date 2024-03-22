import { Effect, Layer } from 'effect'
import * as ExpoSharing from 'expo-sharing'
import { Share as RNShare } from 'react-native'
import { ShareService } from '.'

export const ShareServiceLive = ShareService.context({
  shareMessage: args =>
    Effect.tryPromise(() => RNShare.share(args)).pipe(
      Effect.catchAll(() => Effect.unit),
    ),
  shareFile: args =>
    Effect.tryPromise(() =>
      ExpoSharing.shareAsync(args.uri, {
        dialogTitle: args.title,
        mimeType: args.mimeType,
      }),
    ).pipe(Effect.catchAll(() => Effect.unit)),
}).pipe(Layer.succeedContext)

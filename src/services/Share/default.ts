import * as ExpoSharing from 'expo-sharing'
import { F, Layer } from 'fp'
import { Share as RNShare } from 'react-native'
import { ShareServiceEnv } from '.'

export const ShareServiceLive = ShareServiceEnv.context({
  shareMessage: args =>
    F.tryPromise(() => RNShare.share(args)).pipe(F.catchAll(() => F.unit)),
  shareFile: args =>
    F.tryPromise(() =>
      ExpoSharing.shareAsync(args.uri, {
        dialogTitle: args.title,
        mimeType: args.mimeType,
      }),
    ).pipe(F.catchAll(() => F.unit)),
}).pipe(Layer.succeedContext)

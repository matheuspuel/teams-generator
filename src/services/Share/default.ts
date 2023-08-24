import { $, F, Layer } from 'fp'
import { Share } from 'react-native'
import { ShareServiceEnv } from '.'

export const ShareServiceLive = ShareServiceEnv.context({
  share: args =>
    $(
      F.tryPromise(() => Share.share(args)),
      F.catchAll(() => F.unit),
    ),
}).pipe(Layer.succeedContext)

import { $, F } from 'fp'
import { Share } from 'react-native'
import { ShareService } from '.'

export const defaultShareService: ShareService = {
  share: args =>
    $(
      F.tryPromise(() => Share.share(args)),
      F.catchAll(() => F.unit),
    ),
}

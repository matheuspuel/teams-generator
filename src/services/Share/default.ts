import { $, Eff } from 'fp'
import { Share } from 'react-native'
import { ShareService } from '.'

export const defaultShareService: ShareService = {
  share: args =>
    $(
      Eff.tryPromise(() => Share.share(args)),
      Eff.catchAll(() => Eff.unit),
    ),
}

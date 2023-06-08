import { $, Eff, identity } from 'fp'
import { Share } from 'react-native'
import { ShareService } from '.'

export const defaultShareService: ShareService = {
  share: args =>
    $(
      Eff.tryCatchPromise(() => Share.share(args), identity),
      Eff.catchAll(() => Eff.unit()),
    ),
}

import { $, T, TE, constVoid, identity } from 'fp'
import { Share } from 'react-native'
import { ShareService } from '.'

export const defaultShareService: ShareService = {
  share: args =>
    $(
      TE.tryCatch(() => Share.share(args), identity),
      T.map(constVoid),
    ),
}

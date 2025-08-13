import { Effect } from 'effect'
import type { ShareAction } from 'react-native'

export class ShareService extends Effect.Tag('ShareService')<
  ShareService,
  {
    shareMessage: (args: {
      title: string
      message: string
    }) => Effect.Effect<void | ShareAction>
    shareFile: (args: {
      title: string
      uri: string
      mimeType?: string
    }) => Effect.Effect<void>
  }
>() {}

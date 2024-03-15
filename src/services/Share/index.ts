import * as Context from 'effect/Context'
import { Effect, F } from 'src/utils/fp'

export type ShareService = {
  shareMessage: (args: { title: string; message: string }) => Effect<void>
  shareFile: (args: {
    title: string
    uri: string
    mimeType?: string
  }) => Effect<void>
}

export class ShareServiceEnv extends Context.Tag('ShareService')<
  ShareServiceEnv,
  ShareService
>() {}

export const ShareService = F.serviceFunctions(ShareServiceEnv)

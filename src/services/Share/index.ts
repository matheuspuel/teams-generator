import * as Context from '@effect/data/Context'
import { Effect, F } from 'src/utils/fp'

export type ShareService = {
  shareMessage: (args: {
    title: string
    message: string
  }) => Effect<never, never, void>
  shareFile: (args: {
    title: string
    uri: string
    mimeType?: string
  }) => Effect<never, never, void>
}

export const ShareServiceEnv = Context.Tag<ShareService>()

export const ShareService = F.serviceFunctions(ShareServiceEnv)

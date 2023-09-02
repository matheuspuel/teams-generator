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

export const ShareService = {
  shareMessage: (...args: Parameters<ShareService['shareMessage']>) =>
    F.flatMap(ShareServiceEnv, env => env.shareMessage(...args)),
  shareFile: (...args: Parameters<ShareService['shareFile']>) =>
    F.flatMap(ShareServiceEnv, env => env.shareFile(...args)),
}

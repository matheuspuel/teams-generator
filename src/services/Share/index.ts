import * as Context from '@effect/data/Context'
import { Effect, F } from 'src/utils/fp'

export type ShareService = {
  share: (args: {
    title: string
    message: string
  }) => Effect<never, never, void>
}

export const ShareServiceEnv = Context.Tag<ShareService>()

export const ShareService = {
  // eslint-disable-next-line functional/functional-parameters
  share: (...args: Parameters<ShareService['share']>) =>
    F.flatMap(ShareServiceEnv, env => env.share(...args)),
}

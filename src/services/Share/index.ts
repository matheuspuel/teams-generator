import * as Context from '@effect/data/Context'
import { F, Effect } from 'src/utils/fp'

export type ShareService = {
  share: (args: {
    title: string
    message: string
  }) => Effect<never, never, void>
}

export type ShareServiceEnv = { share: ShareService }

export const ShareServiceEnv = Context.Tag<ShareServiceEnv>()

export const ShareService = {
  // eslint-disable-next-line functional/functional-parameters
  share: (...args: Parameters<ShareService['share']>) =>
    F.flatMap(ShareServiceEnv, env => env.share.share(...args)),
}

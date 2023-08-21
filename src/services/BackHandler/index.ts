import * as Context from '@effect/data/Context'
import { Effect } from '@effect/io/Effect'
import { F } from 'src/utils/fp'

export type BackHandler = {
  exit: Effect<never, never, void>
  subscribe: (
    f: Effect<never, never, void>,
  ) => Effect<never, never, { unsubscribe: Effect<never, never, void> }>
}

export type BackHandlerEnv = { backHandler: BackHandler }

export const BackHandlerEnv = Context.Tag<BackHandlerEnv>()

export const BackHandler = {
  exit: F.flatMap(BackHandlerEnv, env => env.backHandler.exit),
  subscribe: (f: Effect<never, never, void>) =>
    F.flatMap(BackHandlerEnv, env => env.backHandler.subscribe(f)),
}

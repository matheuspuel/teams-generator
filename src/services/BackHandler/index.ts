import * as Context from '@effect/data/Context'
import { Effect } from '@effect/io/Effect'
import { F } from 'src/utils/fp'

export type BackHandler = {
  exit: () => Effect<never, never, void>
  subscribe: (
    f: Effect<never, never, void>,
  ) => Effect<never, never, { unsubscribe: Effect<never, never, void> }>
}

export const BackHandlerEnv = Context.Tag<BackHandler>()

export const BackHandler = F.serviceFunctions(BackHandlerEnv)

import * as Context from '@effect/data/Context'
import { Effect } from '@effect/io/Effect'
import { F, Stream } from 'src/utils/fp'

export type BackHandler = {
  exit: () => Effect<never, never, void>
  stream: Stream.Stream<never, never, void>
}

export const BackHandlerEnv = Context.Tag<BackHandler>()

export const BackHandler = {
  exit: F.serviceFunctionEffect(BackHandlerEnv, s => s.exit),
  stream: Stream.flatMap(BackHandlerEnv, s => s.stream),
}

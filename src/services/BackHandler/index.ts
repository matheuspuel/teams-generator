import * as Context from 'effect/Context'
import { Effect } from 'effect/Effect'
import { F, Stream } from 'src/utils/fp'

export type BackHandler = {
  exit: () => Effect<void>
  stream: Stream.Stream<void>
}

export class BackHandlerEnv extends Context.Tag('BackHandler')<
  BackHandlerEnv,
  BackHandler
>() {}

export const BackHandler = {
  exit: F.serviceFunctionEffect(BackHandlerEnv, s => s.exit),
  stream: Stream.flatMap(BackHandlerEnv, s => s.stream),
}

import { Context, Effect, Stream } from 'effect'

export type BackHandler = {
  exit: () => Effect.Effect<void>
  stream: Stream.Stream<void>
}

export class BackHandlerEnv extends Context.Tag('BackHandler')<
  BackHandlerEnv,
  BackHandler
>() {}

export const BackHandler = {
  exit: Effect.serviceFunctionEffect(BackHandlerEnv, s => s.exit),
  stream: Stream.flatMap(BackHandlerEnv, s => s.stream),
}

import { Context, Effect, Stream } from 'effect'

export type BackHandlerImplementation = {
  exit: () => Effect.Effect<void>
  stream: Stream.Stream<void>
}

export class BackHandler extends Context.Tag('BackHandler')<
  BackHandler,
  BackHandlerImplementation
>() {
  static exit = Effect.serviceFunctionEffect(BackHandler, s => s.exit)
  static stream = Stream.flatMap(BackHandler, s => s.stream)
}

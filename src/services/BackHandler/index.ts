import { Context, Effect, Stream } from 'effect'

export class BackHandler extends Context.Tag('BackHandler')<
  BackHandler,
  {
    exit: () => Effect.Effect<void>
    stream: Stream.Stream<void>
  }
>() {
  static exit = Effect.serviceFunctionEffect(BackHandler, s => s.exit)
  static stream = Stream.flatMap(BackHandler, s => s.stream)
}

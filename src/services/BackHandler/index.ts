import { Chunk, Effect, Stream } from 'effect'
import { BackHandler as BackHandler_ } from 'react-native'

export class BackHandler extends Effect.Service<BackHandler>()('BackHandler', {
  succeed: {
    exit: () => Effect.sync(() => BackHandler_.exitApp()),
    stream: Stream.async<void>(emit => {
      // eslint-disable-next-line functional/no-expression-statements
      BackHandler_.addEventListener('hardwareBackPress', () => {
        // eslint-disable-next-line functional/no-expression-statements
        void emit(Effect.succeed(Chunk.of(undefined)))
        return true
      })
    }),
  },
}) {
  static exit = Effect.serviceFunctionEffect(BackHandler, s => s.exit)
  static stream = Stream.flatMap(BackHandler, s => s.stream)
}

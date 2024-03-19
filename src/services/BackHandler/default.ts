import { Chunk, Effect, Layer, Stream } from 'effect'
import { BackHandler as BackHandler_ } from 'react-native'
import { BackHandlerEnv } from '.'

export const BackHandlerLive = BackHandlerEnv.context({
  exit: () => Effect.sync(() => BackHandler_.exitApp()),
  stream: Stream.async<void>(emit => {
    // eslint-disable-next-line functional/no-expression-statements
    BackHandler_.addEventListener('hardwareBackPress', () => {
      // eslint-disable-next-line functional/no-expression-statements
      void emit(Effect.succeed(Chunk.of(undefined)))
      return true
    })
  }),
}).pipe(Layer.succeedContext)

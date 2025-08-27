import { Chunk, Effect, Layer, Stream } from 'effect'
import { BackHandler as BackHandler_ } from 'react-native'
import { BackHandler } from '.'

export const BackHandlerDefault = BackHandler.context({
  exit: () => Effect.sync(() => BackHandler_.exitApp()),
  stream: Stream.async<void>(emit => {
    BackHandler_.addEventListener('hardwareBackPress', () => {
      void emit(Effect.succeed(Chunk.of(undefined)))
      return true
    })
  }),
}).pipe(Layer.succeedContext)

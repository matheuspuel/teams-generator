import { BackHandler as BackHandler_ } from 'react-native'
import { Chunk, F, Layer, Stream } from 'src/utils/fp'
import { BackHandlerEnv } from '.'

export const BackHandlerLive = BackHandlerEnv.context({
  exit: () => F.sync(() => BackHandler_.exitApp()),
  stream: Stream.async<never, never, void>(emit => {
    // eslint-disable-next-line functional/no-expression-statements
    BackHandler_.addEventListener('hardwareBackPress', () => {
      // eslint-disable-next-line functional/no-expression-statements
      void emit(F.succeed(Chunk.of(undefined)))
      return true
    })
  }),
}).pipe(Layer.succeedContext)

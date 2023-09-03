import { BackHandler as BackHandler_ } from 'react-native'
import { F, Layer } from 'src/utils/fp'
import { BackHandlerEnv } from '.'

export const BackHandlerLive = BackHandlerEnv.context({
  exit: () => F.sync(() => BackHandler_.exitApp()),
  subscribe: f =>
    F.sync(() => {
      const subscription = BackHandler_.addEventListener(
        'hardwareBackPress',
        () => {
          // eslint-disable-next-line functional/no-expression-statements
          void F.runPromise(f)
          return true
        },
      )
      return { unsubscribe: F.sync(() => subscription.remove()) }
    }),
}).pipe(Layer.succeedContext)

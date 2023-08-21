import { BackHandler as BackHandler_ } from 'react-native'
import { F } from 'src/utils/fp'
import { BackHandler } from '.'

export const defaultBackHandler: BackHandler = {
  exit: F.sync(() => BackHandler_.exitApp()),
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
}

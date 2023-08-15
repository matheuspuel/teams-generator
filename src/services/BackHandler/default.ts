import { BackHandler as BackHandler_ } from 'react-native'
import { Eff } from 'src/utils/fp'
import { BackHandler } from '.'

export const defaultBackHandler: BackHandler = {
  exit: Eff.sync(() => BackHandler_.exitApp()),
  subscribe: f =>
    Eff.sync(() => {
      const subscription = BackHandler_.addEventListener(
        'hardwareBackPress',
        () => {
          // eslint-disable-next-line functional/no-expression-statements
          void Eff.runPromise(f)
          return true
        },
      )
      return { unsubscribe: Eff.sync(() => subscription.remove()) }
    }),
}

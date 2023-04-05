import { BackHandler as BackHandler_ } from 'react-native'
import { BackHandler } from '.'

export const defaultBackHandler: BackHandler = {
  exit: () => BackHandler_.exitApp(),
  subscribe: f => env => () => {
    const subscription = BackHandler_.addEventListener(
      'hardwareBackPress',
      () => (f(env)(), true),
    )
    return { unsubscribe: () => subscription.remove() }
  },
}

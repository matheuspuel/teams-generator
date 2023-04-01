import { BackHandler as BackHandler_ } from 'react-native'
import { BackHandler } from '.'

export const hardwareBackPressObserver: BackHandler = {
  subscribe: f => env => () => {
    const subscription = BackHandler_.addEventListener(
      'hardwareBackPress',
      () => !f(env)().shouldBubbleUpEvent,
    )
    return { unsubscribe: () => subscription.remove() }
  },
}

import { IO } from 'fp'
import { BackHandler } from 'react-native'

export const HardwareBackPressObserver = {
  subscribe: (f: IO<{ shouldBubbleUpEvent: boolean }>) => () => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => !f().shouldBubbleUpEvent,
    )
    return { unsubscribe: () => subscription.remove() }
  },
}

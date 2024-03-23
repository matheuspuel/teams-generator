import { AppEvent } from 'src/runtime'
import { named } from '../hyperscript'
import { Pressable } from '../react-native/Pressable'
import { UIElement } from '../types'

export const HeaderButton = named('HeaderButton')(
  (props: { onPress: AppEvent; icon: UIElement }): UIElement =>
    Pressable({
      onPress: props.onPress,
      p: 8,
      borderless: true,
      foreground: true,
    })([props.icon]),
)

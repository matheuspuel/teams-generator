import { AppEvent } from 'src/events'
import { Colors } from 'src/services/Theme'
import { Pressable } from '../react-native/Pressable'
import { UIElement } from '../types'

export const HeaderButton =
  (props: { onPress: AppEvent; icon: UIElement }): UIElement =>
  env =>
    Pressable({
      onPress: props.onPress,
      p: 8,
      borderless: true,
      foreground: true,
    })([props.icon])({
      ...env,
      context: { ...env.context, textColor: Colors.text.light },
    })

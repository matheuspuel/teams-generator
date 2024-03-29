import { MaterialIcons, Pressable, View } from 'src/components'
import { AppEvent } from 'src/runtime'
import { Colors } from 'src/services/Theme'
import { named } from '../hyperscript'
import { PressableProps } from '../react-native/Pressable'
import { UIColor } from '../types'

export const Checkbox = named('Checkbox')(
  (
    props: Omit<PressableProps, 'onPress'> & {
      onToggle: AppEvent
      isSelected: boolean
      pressPadding?: number
      color?: UIColor
    },
  ) =>
    Pressable({
      onPress: props.onToggle,
      borderless: true,
      rippleOpacity: 0.15,
      ...props,
      rippleColor: props.color ?? Colors.primary,
      p: (props.pressPadding ?? 8) + (props.p ?? 0),
      m: (props.pressPadding ?? -8) + (props.m ?? 0),
    })([
      props.isSelected
        ? View({
            borderWidth: 2,
            round: 4,
            h: 28,
            w: 28,
            bg: props.color ?? Colors.primary,
            borderColor: props.color ?? Colors.primary,
          })([MaterialIcons({ name: 'check', color: Colors.white })])
        : View({
            borderWidth: 2,
            round: 4,
            borderColor: Colors.opacity(0.5)(Colors.gray),
            h: 28,
            w: 28,
          })([]),
    ]),
)

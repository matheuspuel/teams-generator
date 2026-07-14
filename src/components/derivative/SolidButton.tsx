import { pipe } from 'effect'
import { Pressable } from 'src/components'
import { TextStyleContext } from 'src/contexts/TextStyle'
import { Colors } from 'src/services/Theme'
import type { PressableProps } from '../react-native/Pressable'
import type { UIColor } from '../types'

export const SolidButton = (
  props: PressableProps & {
    color?: UIColor
    textColor?: UIColor
  },
) => (
  <Pressable
    {...props}
    p={props.p ?? 12}
    round={props.round ?? 4}
    bg={
      props.bg ??
      pipe(props.color ?? Colors.primary, c =>
        props.isEnabled === false ? Colors.opacity(0.375)(c) : c,
      )
    }
    rippleColor={props.rippleColor ?? Colors.black}
    rippleOpacity={props.rippleOpacity ?? 0.5}
  >
    <TextStyleContext.Provider
      value={{
        color: pipe(props.textColor ?? Colors.text.light, c =>
          props.isEnabled === false ? Colors.opacity(0.375)(c) : c,
        ),
      }}
    >
      {props.children}
    </TextStyleContext.Provider>
  </Pressable>
)

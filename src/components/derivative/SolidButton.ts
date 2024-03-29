import { pipe } from 'effect'
import { Pressable } from 'src/components'
import { TextStyleContextProvider } from 'src/contexts/TextStyle'
import { Colors } from 'src/services/Theme'
import { named2 } from '../hyperscript'
import { PressableProps } from '../react-native/Pressable'
import { Children, UIColor, UIElement } from '../types'

export const SolidButton = named2('SolidButton')(
  (
    props: PressableProps & {
      color?: UIColor
      textColor?: UIColor
    },
  ) =>
    (children: Children): UIElement =>
      Pressable({
        ...props,
        p: props.p ?? 12,
        round: props.round ?? 4,
        bg:
          props.bg ??
          pipe(props.color ?? Colors.primary, c =>
            props.isEnabled === false ? Colors.opacity(0.375)(c) : c,
          ),
        rippleColor: props.rippleColor ?? Colors.black,
        rippleOpacity: props.rippleOpacity ?? 0.5,
      })([
        TextStyleContextProvider({
          color: pipe(props.textColor ?? Colors.text.light, c =>
            props.isEnabled === false ? Colors.opacity(0.375)(c) : c,
          ),
        })(children),
      ]),
)

import { F, pipe } from 'fp'
import { Pressable } from 'src/components'
import { TextStyleContextProvider } from 'src/contexts/TextStyle'
import { Colors } from 'src/services/Theme'
import { withOpacity } from 'src/utils/datatypes/Color'
import { named2 } from '../helpers'
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
          pipe(props.color ?? Colors.primary.$5, c =>
            props.isEnabled === false ? F.map(c, withOpacity(95)) : c,
          ),
        rippleColor: props.rippleColor ?? Colors.black,
        rippleOpacity: props.rippleOpacity ?? 0.5,
      })([
        TextStyleContextProvider({
          textColor: pipe(props.textColor ?? Colors.text.light, c =>
            props.isEnabled === false ? F.map(c, withOpacity(95)) : c,
          ),
        })(children),
      ]),
)

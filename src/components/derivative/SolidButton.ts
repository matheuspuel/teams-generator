import { $, R, pipe } from 'fp'
import { Pressable } from 'src/components'
import { Colors } from 'src/services/Theme'
import { withOpacity } from 'src/utils/datatypes/Color'
import { named3 } from '../helpers'
import { PressableProps } from '../react-native/Pressable'
import { Children, UIColor, UIElement } from '../types'

export const SolidButton = named3('SolidButton')(
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
            props.isEnabled === false ? $(c, R.map(withOpacity(95))) : c,
          ),
        rippleColor: props.rippleColor ?? Colors.black,
        rippleOpacity: props.rippleOpacity ?? 0.5,
      })(
        children.map(
          (c): UIElement =>
            env =>
              c({
                ...env,
                context: {
                  ...env.context,
                  textColor: pipe(props.textColor ?? Colors.text.light, c =>
                    props.isEnabled === false
                      ? $(c, R.map(withOpacity(95)))
                      : c,
                  ),
                },
              }),
        ),
      ),
)

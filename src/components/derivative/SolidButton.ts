import { $, R, pipe } from 'fp'
import { Pressable } from 'src/components'
import { AppEvent } from 'src/events'
import { Colors } from 'src/services/Theme'
import { withOpacity } from 'src/utils/datatypes/Color'
import { Children, UIColor, UIElement } from '../types'

export const SolidButton =
  (props: {
    onPress: AppEvent
    isEnabled?: boolean
    color?: UIColor
    textColor?: UIColor
    bg?: UIColor
    rippleColor?: UIColor
    rippleOpacity?: number
    p?: number
    round?: number
  }) =>
  (children: Children): UIElement =>
    Pressable({
      p: props.p ?? 12,
      round: props.round ?? 4,
      bg:
        props.bg ??
        pipe(props.color ?? Colors.primary.$5, c =>
          props.isEnabled === false ? $(c, R.map(withOpacity(95))) : c,
        ),
      onPress: props.onPress,
      isEnabled: props.isEnabled,
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
                  props.isEnabled === false ? $(c, R.map(withOpacity(95))) : c,
                ),
              },
            }),
      ),
    )

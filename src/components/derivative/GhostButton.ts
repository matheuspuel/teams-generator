import { Colors } from 'src/services/Theme'
import { named2 } from '../hyperscript'
import { SolidButton } from './SolidButton'

export const GhostButton: typeof SolidButton = named2('GhostButton')(props =>
  SolidButton({
    ...props,
    rippleColor: props.rippleColor ?? props.color ?? Colors.primary,
    rippleOpacity: props.rippleOpacity ?? 0.15,
    textColor: props.textColor ?? props.color ?? Colors.primary,
    bg: props.bg ?? Colors.opacity(0)(Colors.black),
  }),
)

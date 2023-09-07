import { F } from 'fp'
import { Colors } from 'src/services/Theme'
import { withOpacity } from 'src/utils/datatypes/Color'
import { named3 } from '../helpers'
import { SolidButton } from './SolidButton'

export const GhostButton: typeof SolidButton = named3('GhostButton')(props =>
  SolidButton({
    ...props,
    rippleColor: props.rippleColor ?? props.color ?? Colors.primary.$5,
    rippleOpacity: props.rippleOpacity ?? 0.15,
    textColor: props.textColor ?? props.color ?? Colors.primary.$5,
    bg: props.bg ?? F.map(Colors.black, withOpacity(0)),
  }),
)

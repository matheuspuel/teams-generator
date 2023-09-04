import { R, pipe } from 'fp'
import { Colors } from 'src/services/Theme'
import { withOpacity } from 'src/utils/datatypes/Color'
import { SolidButton } from './SolidButton'

export const GhostButton: typeof SolidButton = props =>
  SolidButton({
    ...props,
    rippleColor: props.rippleColor ?? props.color ?? Colors.primary.$5,
    rippleOpacity: props.rippleOpacity ?? 0.15,
    textColor: props.textColor ?? props.color ?? Colors.primary.$5,
    bg: props.bg ?? pipe(Colors.black, R.map(withOpacity(0))),
  })

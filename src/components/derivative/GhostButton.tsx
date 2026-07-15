import { useTheme } from 'src/contexts/Theme'
import { SolidButton } from './SolidButton'

export const GhostButton: typeof SolidButton = props => {
  const { colors } = useTheme()
  return (
    <SolidButton
      {...props}
      rippleColor={props.rippleColor ?? props.color ?? colors.primary}
      rippleOpacity={props.rippleOpacity ?? 0.15}
      textColor={props.textColor ?? props.color ?? colors.primary}
      bg={props.bg ?? colors.black.setOpacityFactor(0)}
    />
  )
}

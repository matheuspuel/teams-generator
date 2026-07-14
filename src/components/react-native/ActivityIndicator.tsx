import { ActivityIndicator as RNActivityIndicator_ } from 'react-native'
import { useThemeGetRawColor } from 'src/contexts/Theme'
import type { UIColor } from '../types'

export type ActivityIndicatorProps = {
  size?: 'large' | 'small'
  color?: UIColor
}

export const ActivityIndicator = (props: ActivityIndicatorProps) => {
  const getRawColor = useThemeGetRawColor()
  return (
    <RNActivityIndicator_
      size={props?.size ?? 'large'}
      color={props?.color ? getRawColor(props.color) : undefined}
    />
  )
}

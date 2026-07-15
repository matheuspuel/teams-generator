import { ActivityIndicator as RNActivityIndicator_ } from 'react-native'
import type { Color } from 'src/utils/datatypes/Color'

export type ActivityIndicatorProps = {
  size?: 'large' | 'small'
  color?: Color
}

export const ActivityIndicator = (props: ActivityIndicatorProps) => {
  return (
    <RNActivityIndicator_
      size={props?.size ?? 'large'}
      color={props?.color?.toHex()}
    />
  )
}

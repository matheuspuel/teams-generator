import { ActivityIndicator as ActivityIndicator_ } from 'react-native'
import { Color, toHex } from 'src/utils/datatypes/Color'

type ActivityIndicatorProps = { size?: 'large' | 'small'; color?: Color }

export const ActivityIndicator = (props: ActivityIndicatorProps) => (
  <ActivityIndicator_
    {...{
      size: props?.size ?? 'large',
      color: props?.color ? toHex(props.color) : undefined,
    }}
  />
)

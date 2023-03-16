import { ActivityIndicator as ActivityIndicator_ } from 'react-native'
import { Color } from 'src/utils/datatypes'

type ActivityIndicatorProps = { size?: 'large' | 'small'; color?: Color }

export const ActivityIndicator = ({
  x: props,
}: {
  x?: ActivityIndicatorProps
}) => (
  <ActivityIndicator_
    {...{
      size: props?.size ?? 'large',
      color: props?.color ? Color.toHex(props.color) : undefined,
    }}
  />
)

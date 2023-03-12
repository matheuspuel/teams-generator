import { ActivityIndicator as ActivityIndicator_ } from 'src/components/hyperscript/reactNative'
import { Color, toHex } from 'src/utils/Color'

type ActivityIndicatorProps = { size?: 'large' | 'small'; color?: Color }

export const ActivityIndicator = (props?: ActivityIndicatorProps) =>
  ActivityIndicator_({
    size: props?.size ?? 'large',
    color: props?.color ? toHex(props.color) : undefined,
  })

import RawIcons_ from '@react-native-vector-icons/material-icons'
import * as React from 'react'
import { useTextStyle } from 'src/contexts/TextStyle'
import type { Color } from 'src/utils/datatypes/Color'

export type IconProps = {
  name: React.ComponentProps<typeof RawIcons_>['name']
  color?: Color
  size?: number
  align?: 'left' | 'right' | 'center'
}

export const MaterialIcons = (props: IconProps) => {
  const textStyle = useTextStyle()
  return (
    <RawIcons_
      name={props.name}
      size={props.size ?? 24}
      color={(props.color ?? textStyle.color).toHex()}
      style={{ textAlign: props.align }}
    />
  )
}

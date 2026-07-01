import RawIcons_ from '@expo/vector-icons/MaterialIcons'
import * as React from 'react'
import { useTextStyle } from 'src/contexts/TextStyle'
import { useThemeGetRawColor } from 'src/contexts/Theme'
import { UIColor } from '../types'

export type IconProps = {
  name: React.ComponentProps<typeof RawIcons_>['name']
  color?: UIColor
  size?: number
  align?: 'left' | 'right' | 'center'
}

export const MaterialIcons = (props: IconProps) => {
  const textStyle = useTextStyle()
  const getRawColor = useThemeGetRawColor()
  return (
    <RawIcons_
      name={props.name}
      size={props.size ?? 24}
      color={getRawColor(props.color ?? textStyle.color)}
      style={{ textAlign: props.align }}
    />
  )
}

import MaterialCommunityIcons_ from '@expo/vector-icons/MaterialCommunityIcons'
import React from 'react'
import { Color, toHex } from 'src/utils/datatypes/Color'

type IconProps = {
  name: React.ComponentProps<typeof MaterialCommunityIcons_>['name']
  color: Color
  size: number
  align?: 'left' | 'right' | 'center'
}

export const MaterialCommunityIcons = ({ x: props }: { x: IconProps }) => (
  <MaterialCommunityIcons_
    {...{
      name: props.name,
      size: props.size,
      color: toHex(props.color),
      style: { textAlign: props.align },
    }}
  />
)

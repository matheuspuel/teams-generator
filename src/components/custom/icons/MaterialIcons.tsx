import MaterialIcons_ from '@expo/vector-icons/MaterialIcons'
import React from 'react'
import { Color, toHex } from 'src/utils/datatypes/Color'

type IconProps = {
  name: React.ComponentProps<typeof MaterialIcons_>['name']
  color: Color
  size: number
  align?: 'left' | 'right' | 'center'
}

export const MaterialIcons = ({ x: props }: { x: IconProps }) => (
  <MaterialIcons_
    {...{
      name: props.name,
      size: props.size,
      color: toHex(props.color),
      style: { textAlign: props.align },
    }}
  />
)

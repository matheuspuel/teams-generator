import React from 'react'
import { colors } from 'src/theme'
import { Color } from 'src/utils/datatypes'
import { shade } from 'src/utils/datatypes/Color'
import { Pressable } from '../basic/Pressable'

type ButtonProps = React.ComponentProps<typeof Pressable> & {
  x: {
    baseColor?: Color
  }
}

export const Button = ({ x: props, children }: ButtonProps) => (
  <Pressable
    x={{
      align: 'center',
      p: 8,
      round: 4,
      bg:
        props.isEnabled ?? true
          ? props.baseColor ?? colors.primary.$5
          : colors.gray.$2,
      ...props,
      pressed: {
        bg:
          props.pressed?.bg ??
          shade(0.3)(props.bg ?? props.baseColor ?? colors.primary.$5),
        ...props.pressed,
      },
    }}
    children={children}
  />
)

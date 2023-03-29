import React from 'react'
import { defaultColors } from 'src/services/Theme/default'
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
          ? props.baseColor ?? defaultColors.primary.$5
          : defaultColors.gray.$2,
      ...props,
      pressed: {
        bg:
          props.pressed?.bg ??
          shade(0.3)(props.bg ?? props.baseColor ?? defaultColors.primary.$5),
        ...props.pressed,
      },
    }}
    children={children}
  />
)

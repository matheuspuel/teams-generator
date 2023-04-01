import React from 'react'
import { MaterialIcons as MaterialIcons_ } from 'src/components/custom'
import { IconProps } from 'src/components/custom/icons/MaterialIcons'

export const MaterialIcons =
  <R>(props: IconProps<R>) =>
  (env: R) =>
    React.createElement(MaterialIcons_<R>, { x: props, env })

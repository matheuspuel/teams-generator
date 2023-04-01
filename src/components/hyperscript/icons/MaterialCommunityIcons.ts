import React from 'react'
import { MaterialCommunityIcons as MaterialCommunityIcons_ } from 'src/components/custom'
import { IconProps } from 'src/components/custom/icons/MaterialCommunityIcons'

export const MaterialCommunityIcons =
  <R>(props: IconProps<R>) =>
  (env: R) =>
    React.createElement(MaterialCommunityIcons_<R>, { x: props, env })

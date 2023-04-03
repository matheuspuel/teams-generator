import React from 'react'
import { MaterialCommunityIcons as MaterialCommunityIcons_ } from 'src/components/custom'
import { IconProps } from 'src/components/custom/icons/MaterialCommunityIcons'

export const MaterialCommunityIcons =
  <R>(props: IconProps<R>) =>
  // eslint-disable-next-line react/display-name
  (env: R) =>
    React.createElement(MaterialCommunityIcons_<R>, { x: props, env })

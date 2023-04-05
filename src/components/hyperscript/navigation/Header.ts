import React from 'react'
import { Header as Header_ } from 'src/components/custom'
import { HeaderProps } from 'src/components/custom/navigation/Header'
import { Element } from 'src/components/custom/types'

export const Header =
  <R1, R2, R3>(props: HeaderProps<R1, R2, R3>) =>
  // eslint-disable-next-line react/display-name
  (env: R1 & R2 & R3): Element =>
    React.createElement(Header_<R1, R2, R3>, { x: props, env })

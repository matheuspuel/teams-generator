import React from 'react'
import { Header as Header_ } from 'src/components/custom'
import { HeaderProps } from 'src/components/custom/navigation/Header'

export const Header =
  <R>(props: HeaderProps<R>) =>
  // eslint-disable-next-line react/display-name
  (env: R) =>
    React.createElement(Header_<R>, { x: props, env })

import React from 'react'
import { Header as Header_ } from 'src/components/custom'
import { HeaderProps } from 'src/components/custom/navigation/Header'

export const Header =
  <R>(props: HeaderProps<R>) =>
  (env: R) =>
    React.createElement(Header_<R>, { x: props, env })

import React from 'react'
import { Txt as Txt_ } from 'src/components/custom'
import { TextProps } from 'src/components/custom/react-native/Txt'

export const Txt =
  <R>(props?: TextProps<R>) =>
  (children: string) =>
  // eslint-disable-next-line react/display-name
  (env: R) =>
    React.createElement(Txt_<R>, { x: props, env }, children)

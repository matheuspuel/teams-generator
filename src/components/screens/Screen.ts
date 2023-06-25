import { $, A, apply } from 'fp'
import React from 'react'
import { Screen as RNSScreen_ } from 'react-native-screens'
import { Children, JSXElementsChildren, UIElement } from 'src/components/types'
import { UIEnv } from 'src/services/UI'

export type ScreenProps = object

export type ScreenArgs = {
  x: ScreenProps
  children?: JSXElementsChildren
  env: UIEnv
}

const getRawProps = ({
  x: _props,
  children,
  env: _env,
}: ScreenArgs): React.ComponentProps<typeof RNSScreen_> & {
  key?: string
} => ({ children: children })

const Screen_ = (args: ScreenArgs) =>
  React.createElement(RNSScreen_, getRawProps(args))

export const Screen =
  (props: ScreenProps = {}) =>
  (children: Children): UIElement =>
  // eslint-disable-next-line react/display-name
  env =>
    React.createElement(
      Screen_,
      { x: props, env },
      ...$(children, A.map(apply(env))),
    )

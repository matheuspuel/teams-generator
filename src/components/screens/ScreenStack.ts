import { $, A, apply } from 'fp'
import React from 'react'
import { StyleSheet } from 'react-native'
import { ScreenStack as RNSScreenStack_ } from 'react-native-screens'
import { Children, JSXElementsChildren, UIElement } from 'src/components/types'
import { UIEnv } from 'src/services/UI'

export type ScreenStackProps = object

export type ScreenStackArgs = {
  x: ScreenStackProps
  children?: JSXElementsChildren
  env: UIEnv
}

const getRawProps = ({
  x: _props,
  children,
  env: _env,
}: ScreenStackArgs): React.ComponentProps<typeof RNSScreenStack_> & {
  key?: string
} => ({
  children: children,
  style: StyleSheet.absoluteFill,
})

const ScreenStack_ = (args: ScreenStackArgs) =>
  React.createElement(RNSScreenStack_, getRawProps(args))

export const ScreenStack =
  (props: ScreenStackProps = {}) =>
  (children: Children): UIElement =>
  // eslint-disable-next-line react/display-name
  env =>
    React.createElement(
      ScreenStack_,
      { x: props, env },
      ...$(children, A.map(apply(env))),
    )

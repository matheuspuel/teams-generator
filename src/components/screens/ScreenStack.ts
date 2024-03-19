import * as React from 'react'
import { StyleSheet } from 'react-native'
import { ScreenStack as RNSScreenStack_ } from 'react-native-screens'
import { Children, JSXElementsChildren, UIElement } from 'src/components/types'

export type ScreenStackProps = object

export type ScreenStackArgs = {
  x: ScreenStackProps
  children?: JSXElementsChildren
}

const getRawProps = ({
  x: _props,
  children,
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
  // eslint-disable-next-line react/display-name
  (children: Children): UIElement =>
    React.createElement(ScreenStack_, { x: props }, ...children)

import React from 'react'
import { StyleSheet } from 'react-native'
import { ScreenStack as ScreenStack_ } from 'react-native-screens'
import { JSXElementsChildren } from '../types'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type ScreenStackProps<R> = object

export type ScreenStackArgs<R> = {
  x: ScreenStackProps<R>
  children?: JSXElementsChildren
  env: R
}

const getRawProps = <R,>({
  x: _props,
  children,
  env: _env,
}: ScreenStackArgs<R>): React.ComponentProps<typeof ScreenStack_> & {
  key?: string
} => ({
  children: children,
  style: StyleSheet.absoluteFill,
})

export const ScreenStack = <R,>(args: ScreenStackArgs<R>) => (
  <ScreenStack_ {...getRawProps(args)} />
)

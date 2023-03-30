import React from 'react'
import { StyleSheet } from 'react-native'
import { ScreenStack as ScreenStack_ } from 'react-native-screens'
import { JSXElementsChildren } from '../types'

export type ScreenStackProps<R> = {}

export type ScreenStackArgs<R> = {
  x: ScreenStackProps<R>
  children?: JSXElementsChildren
  env: R
}

const getRawProps = <R extends unknown>({
  x: props,
  children,
  env,
}: ScreenStackArgs<R>): React.ComponentProps<typeof ScreenStack_> & {
  key?: string
} => ({
  children: children,
  style: StyleSheet.absoluteFill,
})

export const ScreenStack = <R extends unknown>(args: ScreenStackArgs<R>) => (
  <ScreenStack_ {...getRawProps(args)} />
)

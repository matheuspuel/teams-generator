import React from 'react'
import { Screen as Screen_ } from 'react-native-screens'
import { JSXElementsChildren } from '../types'

export type ScreenProps<R> = {}

export type ScreenArgs<R> = {
  x: ScreenProps<R>
  children?: JSXElementsChildren
  env: R
}

const getRawProps = <R extends unknown>({
  x: props,
  children,
  env,
}: ScreenArgs<R>): React.ComponentProps<typeof Screen_> & {
  key?: string
} => ({ children: children })

export const Screen = <R extends unknown>(args: ScreenArgs<R>) => (
  <Screen_ {...getRawProps(args)} />
)

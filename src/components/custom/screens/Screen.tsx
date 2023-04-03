import React from 'react'
import { Screen as Screen_ } from 'react-native-screens'
import { JSXElementsChildren } from '../types'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type ScreenProps<R> = object

export type ScreenArgs<R> = {
  x: ScreenProps<R>
  children?: JSXElementsChildren
  env: R
}

const getRawProps = <R,>({
  x: _props,
  children,
  env: _env,
}: ScreenArgs<R>): React.ComponentProps<typeof Screen_> & {
  key?: string
} => ({ children: children })

export const Screen = <R,>(args: ScreenArgs<R>) => (
  <Screen_ {...getRawProps(args)} />
)

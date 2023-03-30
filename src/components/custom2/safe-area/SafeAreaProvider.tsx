import { Reader } from 'fp'
import React from 'react'
import { SafeAreaProvider as SafeAreaProvider_ } from 'react-native-safe-area-context'
import { Color } from 'src/utils/datatypes'
import { JSXElementsChildren } from '../types'

export type SafeAreaProviderProps<R> = {
  flex?: number
  bg?: Reader<R, Color>
}

export type SafeAreaProviderArgs<R> = {
  x: SafeAreaProviderProps<R>
  children?: JSXElementsChildren
  env: R
}

const getRawProps = <R extends unknown>({
  x: props,
  children,
  env,
}: SafeAreaProviderArgs<R>): React.ComponentProps<typeof SafeAreaProvider_> & {
  key?: string
} => ({
  children: children,
  style: {
    backgroundColor: props?.bg ? Color.toHex(props.bg(env)) : undefined,
  },
})

export const SafeAreaProvider = <R extends unknown>(
  args: SafeAreaProviderArgs<R>,
) => <SafeAreaProvider_ {...getRawProps(args)} />

import { $, A, O, apply } from 'fp'
import React from 'react'
import { SafeAreaProvider as RawSafeAreaProvider_ } from 'react-native-safe-area-context'
import {
  Children,
  JSXElementsChildren,
  UIColor,
  UIElement,
} from 'src/components/types'
import { SafeAreaService } from 'src/services/SafeArea'
import { UIEnv } from 'src/services/UI'
import { Color } from 'src/utils/datatypes'

export type SafeAreaProviderProps = {
  flex?: number
  bg?: UIColor
}

export type SafeAreaProviderArgs = {
  x: SafeAreaProviderProps
  children?: JSXElementsChildren
  env: UIEnv
}

const getRawProps = ({
  x: props,
  children,
  env,
}: SafeAreaProviderArgs): React.ComponentProps<typeof RawSafeAreaProvider_> & {
  key?: string
} => ({
  children: children,
  initialMetrics: O.getOrUndefined(SafeAreaService.initialMetrics(env)),
  style: {
    backgroundColor: props?.bg ? Color.toHex(props.bg(env)) : undefined,
  },
})

const SafeAreaProvider_ = (args: SafeAreaProviderArgs) =>
  React.createElement(RawSafeAreaProvider_, getRawProps(args))

export const SafeAreaProvider =
  (props: SafeAreaProviderProps = {}) =>
  (children: Children): UIElement =>
  // eslint-disable-next-line react/display-name
  env =>
    React.createElement(
      SafeAreaProvider_,
      { x: props, env },
      ...$(children, A.map(apply(env))),
    )
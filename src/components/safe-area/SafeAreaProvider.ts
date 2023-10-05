import { F, O, Runtime, pipe } from 'fp'
import React from 'react'
import { SafeAreaProvider as RawSafeAreaProvider_ } from 'react-native-safe-area-context'
import {
  Children,
  JSXElementsChildren,
  UIColor,
  UIElement,
} from 'src/components/types'
import { useRuntime } from 'src/contexts/Runtime'
import { AppRuntime } from 'src/runtime'
import { SafeAreaService } from 'src/services/SafeArea'
import { Color } from 'src/utils/datatypes'
import { named2 } from '../hyperscript'

export type SafeAreaProviderProps = {
  flex?: number
  bg?: UIColor
}

export type SafeAreaProviderArgs = {
  x: SafeAreaProviderProps
  children?: JSXElementsChildren
  runtime: AppRuntime
}

const getRawProps = ({
  x: props,
  children,
  runtime,
}: SafeAreaProviderArgs): React.ComponentProps<typeof RawSafeAreaProvider_> & {
  key?: string
} => ({
  children: children,
  initialMetrics: pipe(
    SafeAreaService.initialMetrics(),
    F.map(O.getOrUndefined),
    Runtime.runSync(runtime),
  ),
  style: {
    backgroundColor: props?.bg
      ? Color.toHex(Runtime.runSync(runtime)(props.bg))
      : undefined,
  },
})

const SafeAreaProvider_ = (args: SafeAreaProviderArgs) =>
  React.createElement(RawSafeAreaProvider_, getRawProps(args))

export const SafeAreaProvider = named2('SafeAreaProvider')(
  (props: SafeAreaProviderProps = {}) =>
    // eslint-disable-next-line react/display-name
    (children: Children): UIElement => {
      const runtime = useRuntime()
      return React.createElement(
        SafeAreaProvider_,
        { x: props, runtime },
        ...children,
      )
    },
)

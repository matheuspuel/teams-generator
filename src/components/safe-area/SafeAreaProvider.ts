import { Effect, Option, Runtime, pipe } from 'effect'
import * as React from 'react'
import { SafeAreaProvider as RawSafeAreaProvider_ } from 'react-native-safe-area-context'
import {
  Children,
  JSXElementsChildren,
  UIColor,
  UIElement,
} from 'src/components/types'
import { useRuntime } from 'src/contexts/Runtime'
import { useThemeGetRawColor } from 'src/contexts/Theme'
import { AppRuntime } from 'src/runtime'
import { SafeAreaService } from 'src/services/SafeArea'
import { named2 } from '../hyperscript'

export type SafeAreaProviderProps = {
  flex?: number
  bg?: UIColor
}

export type SafeAreaProviderArgs = {
  x: SafeAreaProviderProps
  children?: JSXElementsChildren
  runtime: AppRuntime
  getRawColor: (color: UIColor) => string
}

const getRawProps = ({
  x: props,
  children,
  runtime,
  getRawColor,
}: SafeAreaProviderArgs): React.ComponentProps<typeof RawSafeAreaProvider_> & {
  key?: string
} => ({
  children: children,
  initialMetrics: pipe(
    SafeAreaService.initialMetrics(),
    Effect.map(Option.getOrUndefined),
    Runtime.runSync(runtime),
  ),
  style: {
    backgroundColor: props?.bg ? getRawColor(props.bg) : undefined,
  },
})

const SafeAreaProvider_ = (args: SafeAreaProviderArgs) =>
  React.createElement(RawSafeAreaProvider_, getRawProps(args))

export const SafeAreaProvider = named2('SafeAreaProvider')(
  (props: SafeAreaProviderProps = {}) =>
    // eslint-disable-next-line react/display-name
    (children: Children): UIElement => {
      const runtime = useRuntime()
      const getRawColor = useThemeGetRawColor()
      return React.createElement(
        SafeAreaProvider_,
        { x: props, runtime, getRawColor },
        ...children,
      )
    },
)

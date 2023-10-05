import {
  StatusBar as RawStatusBar_,
  StatusBarAnimation,
  StatusBarStyle,
} from 'expo-status-bar'
import React from 'react'
import { useRuntime } from 'src/contexts/Runtime'
import { AppRuntime } from 'src/runtime'
import { Color } from 'src/utils/datatypes'
import { Runtime } from 'src/utils/fp'
import { named } from '../hyperscript'
import { UIColor, UIElement } from '../types'

export type StatusBarProps = {
  style?: StatusBarStyle
  animated?: boolean
  hidden?: boolean
  hideTransitionAnimation?: StatusBarAnimation
  networkActivityIndicatorVisible?: boolean
  backgroundColor?: UIColor
  translucent?: boolean
}

export type StatusBarArgs = {
  x: StatusBarProps
  runtime: AppRuntime
}

const getRawProps = ({
  x: props,
  runtime,
}: StatusBarArgs): React.ComponentProps<typeof RawStatusBar_> => ({
  animated: props.animated,
  backgroundColor: props.backgroundColor
    ? Color.toHex(Runtime.runSync(runtime)(props.backgroundColor))
    : undefined,
  hidden: props.hidden,
  hideTransitionAnimation: props.hideTransitionAnimation,
  networkActivityIndicatorVisible: props.networkActivityIndicatorVisible,
  style: props.style,
  translucent: props.translucent,
})

const StatusBar_ = (args: StatusBarArgs) =>
  React.createElement(RawStatusBar_, getRawProps(args))

export const StatusBar = named('StatusBar')((
  props: StatusBarProps,
): UIElement => {
  const runtime = useRuntime()
  return React.createElement(StatusBar_, { x: props, runtime })
})

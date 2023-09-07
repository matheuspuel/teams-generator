import {
  StatusBar as RawStatusBar_,
  StatusBarAnimation,
  StatusBarStyle,
} from 'expo-status-bar'
import React from 'react'
import { UIEnv } from 'src/services/UI'
import { Color } from 'src/utils/datatypes'
import { Runtime } from 'src/utils/fp'
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
  env: UIEnv
}

const getRawProps = ({
  x: props,
  env,
}: StatusBarArgs): React.ComponentProps<typeof RawStatusBar_> => ({
  animated: props.animated,
  backgroundColor: props.backgroundColor
    ? Color.toHex(Runtime.runSync(env.runtime)(props.backgroundColor))
    : undefined,
  hidden: props.hidden,
  hideTransitionAnimation: props.hideTransitionAnimation,
  networkActivityIndicatorVisible: props.networkActivityIndicatorVisible,
  style: props.style,
  translucent: props.translucent,
})

const StatusBar_ = (args: StatusBarArgs) =>
  React.createElement(RawStatusBar_, getRawProps(args))

export const StatusBar =
  (props: StatusBarProps): UIElement =>
  // eslint-disable-next-line react/display-name
  env =>
    React.createElement(StatusBar_, { x: props, env })

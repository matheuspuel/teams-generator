import {
  StatusBarAnimation,
  StatusBarStyle,
  StatusBar as StatusBar_,
} from 'expo-status-bar'
import { Reader } from 'fp'
import React from 'react'
import { Color } from 'src/utils/datatypes'

export type StatusBarProps<R> = {
  style?: StatusBarStyle
  animated?: boolean
  hidden?: boolean
  hideTransitionAnimation?: StatusBarAnimation
  networkActivityIndicatorVisible?: boolean
  backgroundColor?: Reader<R, Color>
  translucent?: boolean
}

export type StatusBarArgs<R> = {
  x: StatusBarProps<R>
  env: R
}

const getRawProps = <R,>({
  x: props,
  env,
}: StatusBarArgs<R> & {}): React.ComponentProps<typeof StatusBar_> => ({
  animated: props.animated,
  backgroundColor: props.backgroundColor
    ? Color.toHex(props.backgroundColor(env))
    : undefined,
  hidden: props.hidden,
  hideTransitionAnimation: props.hideTransitionAnimation,
  networkActivityIndicatorVisible: props.networkActivityIndicatorVisible,
  style: props.style,
  translucent: props.translucent,
})

export const StatusBar = <R,>(args: StatusBarArgs<R>) => (
  <StatusBar_ {...getRawProps(args)} />
)

import {
  StatusBar as RawStatusBar_,
  StatusBarAnimation,
  StatusBarStyle,
} from 'expo-status-bar'
import * as React from 'react'
import { useThemeGetRawColor } from 'src/contexts/Theme'
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
  getRawColor: (color: UIColor) => string
}

const getRawProps = ({
  x: props,
  getRawColor,
}: StatusBarArgs): React.ComponentProps<typeof RawStatusBar_> => ({
  animated: props.animated,
  backgroundColor: props.backgroundColor
    ? getRawColor(props.backgroundColor)
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
  const getRawColor = useThemeGetRawColor()
  return React.createElement(StatusBar_, { x: props, getRawColor })
})

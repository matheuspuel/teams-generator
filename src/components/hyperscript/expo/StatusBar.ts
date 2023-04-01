import React from 'react'
import {
  StatusBar as StatusBar_,
  StatusBarProps,
} from 'src/components/custom/expo/StatusBar'

export const StatusBar =
  <R>(props: StatusBarProps<R>) =>
  (env: R) =>
    React.createElement(StatusBar_<R>, { x: props, env })

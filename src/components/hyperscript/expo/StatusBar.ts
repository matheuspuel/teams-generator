import React from 'react'
import {
  StatusBar as StatusBar_,
  StatusBarProps,
} from 'src/components/custom/expo/StatusBar'

export const StatusBar =
  <R>(props: StatusBarProps<R>) =>
  // eslint-disable-next-line react/display-name
  (env: R) =>
    React.createElement(StatusBar_<R>, { x: props, env })

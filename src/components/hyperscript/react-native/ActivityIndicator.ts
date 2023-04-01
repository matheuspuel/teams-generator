import React from 'react'
import { ActivityIndicator as ActivityIndicator_ } from 'src/components/custom'
import { ActivityIndicatorProps } from 'src/components/custom/react-native/ActivityIndicator'

export const ActivityIndicator =
  <R>(props: ActivityIndicatorProps<R>) =>
  (env: R) =>
    React.createElement(ActivityIndicator_<R>, { x: props, env })

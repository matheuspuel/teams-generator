import React from 'react'
import { ActivityIndicator as RNActivityIndicator_ } from 'react-native'
import { UIEnv } from 'src/services/UI'
import { Color } from 'src/utils/datatypes'
import { Runtime } from 'src/utils/fp'
import { UIColor, UIElement } from '../types'

export type ActivityIndicatorProps = {
  size?: 'large' | 'small'
  color?: UIColor
}

export type ActivityIndicatorArgs = {
  x: ActivityIndicatorProps
  env: UIEnv
}

const getRawProps = ({
  x: props,
  env,
}: ActivityIndicatorArgs): React.ComponentProps<
  typeof RNActivityIndicator_
> => ({
  size: props?.size ?? 'large',
  color: props?.color
    ? Color.toHex(Runtime.runSync(env.runtime)(props.color))
    : undefined,
})

const ActivityIndicator_ = (args: ActivityIndicatorArgs) =>
  React.createElement(RNActivityIndicator_, getRawProps(args))

export const ActivityIndicator =
  (props: ActivityIndicatorProps): UIElement =>
  // eslint-disable-next-line react/display-name
  env =>
    React.createElement(ActivityIndicator_, { x: props, env })

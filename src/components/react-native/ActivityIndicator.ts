import React from 'react'
import { ActivityIndicator as RNActivityIndicator_ } from 'react-native'
import { useRuntime } from 'src/contexts/Runtime'
import { AppRuntime } from 'src/runtime'
import { Color } from 'src/utils/datatypes'
import { Runtime } from 'src/utils/fp'
import { named } from '../hyperscript'
import { UIColor, UIElement } from '../types'

export type ActivityIndicatorProps = {
  size?: 'large' | 'small'
  color?: UIColor
}

export type ActivityIndicatorArgs = {
  x: ActivityIndicatorProps
  runtime: AppRuntime
}

const getRawProps = ({
  x: props,
  runtime,
}: ActivityIndicatorArgs): React.ComponentProps<
  typeof RNActivityIndicator_
> => ({
  size: props?.size ?? 'large',
  color: props?.color
    ? Color.toHex(Runtime.runSync(runtime)(props.color))
    : undefined,
})

const ActivityIndicator_ = (args: ActivityIndicatorArgs) =>
  React.createElement(RNActivityIndicator_, getRawProps(args))

export const ActivityIndicator = named('ActivityIndicator')((
  props: ActivityIndicatorProps,
): UIElement => {
  const runtime = useRuntime()
  return React.createElement(ActivityIndicator_, { x: props, runtime })
})

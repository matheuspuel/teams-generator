import * as React from 'react'
import { ActivityIndicator as RNActivityIndicator_ } from 'react-native'
import { useThemeGetRawColor } from 'src/contexts/Theme'
import { named } from '../hyperscript'
import { UIColor, UIElement } from '../types'

export type ActivityIndicatorProps = {
  size?: 'large' | 'small'
  color?: UIColor
}

export type ActivityIndicatorArgs = {
  x: ActivityIndicatorProps
  getRawColor: (color: UIColor) => string
}

const getRawProps = ({
  x: props,
  getRawColor,
}: ActivityIndicatorArgs): React.ComponentProps<
  typeof RNActivityIndicator_
> => ({
  size: props?.size ?? 'large',
  color: props?.color ? getRawColor(props.color) : undefined,
})

const ActivityIndicator_ = (args: ActivityIndicatorArgs) =>
  React.createElement(RNActivityIndicator_, getRawProps(args))

export const ActivityIndicator = named('ActivityIndicator')((
  props: ActivityIndicatorProps,
): UIElement => {
  const getRawColor = useThemeGetRawColor()
  return React.createElement(ActivityIndicator_, { x: props, getRawColor })
})

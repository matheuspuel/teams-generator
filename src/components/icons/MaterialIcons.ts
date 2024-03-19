import RawIcons_ from '@expo/vector-icons/MaterialIcons'
import * as React from 'react'
import { TextStyleContext, useTextStyle } from 'src/contexts/TextStyle'
import { useThemeGetRawColor } from 'src/contexts/Theme'
import { named } from '../hyperscript'
import { UIColor, UIElement } from '../types'

export type IconProps = {
  name: React.ComponentProps<typeof RawIcons_>['name']
  color?: UIColor
  size?: number
  align?: 'left' | 'right' | 'center'
}

export type IconArgs = {
  x: IconProps
  textStyle: TextStyleContext
  getRawColor: (color: UIColor) => string
}

const getRawProps = ({
  x: props,
  textStyle,
  getRawColor,
}: IconArgs): React.ComponentProps<typeof RawIcons_> => ({
  name: props.name,
  size: props.size ?? 24,
  color: getRawColor(props.color ?? textStyle.color),
  style: { textAlign: props.align },
})

const MaterialIcons_ = (args: IconArgs) =>
  React.createElement(RawIcons_, getRawProps(args))

export const MaterialIcons = named('MaterialIcons')((
  props: IconProps,
): UIElement => {
  const textStyle = useTextStyle()
  const getRawColor = useThemeGetRawColor()
  return React.createElement(MaterialIcons_, {
    x: props,
    textStyle,
    getRawColor,
  })
})

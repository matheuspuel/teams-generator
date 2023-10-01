import RawIcons_ from '@expo/vector-icons/MaterialCommunityIcons'
import React from 'react'
import { useRuntime } from 'src/contexts/Runtime'
import { TextStyleContext, useTextStyle } from 'src/contexts/TextStyle'
import { AppRuntime } from 'src/runtime'
import { Color } from 'src/utils/datatypes'
import { Runtime } from 'src/utils/fp'
import { named } from '../helpers'
import { UIColor, UIElement } from '../types'

export type IconProps = {
  name: React.ComponentProps<typeof RawIcons_>['name']
  color?: UIColor
  size?: number
  align?: 'left' | 'right' | 'center'
}

export type IconArgs = {
  x: IconProps
  runtime: AppRuntime
  textStyle: TextStyleContext
}

const getRawProps = ({
  x: props,
  runtime,
  textStyle,
}: IconArgs): React.ComponentProps<typeof RawIcons_> => ({
  name: props.name,
  size: props.size ?? 24,
  color: Color.toHex(
    Runtime.runSync(runtime)(props.color ?? textStyle.textColor),
  ),
  style: { textAlign: props.align },
})

const MaterialCommunityIcons_ = (args: IconArgs) =>
  React.createElement(RawIcons_, getRawProps(args))

export const MaterialCommunityIcons = named('MaterialCommunityIcons')((
  props: IconProps,
): UIElement => {
  const runtime = useRuntime()
  const textStyle = useTextStyle()
  return React.createElement(MaterialCommunityIcons_, {
    x: props,
    runtime,
    textStyle,
  })
})

import RawIcons_ from '@expo/vector-icons/MaterialCommunityIcons'
import React from 'react'
import { UIEnv } from 'src/services/UI'
import { Color } from 'src/utils/datatypes'
import { UIColor, UIElement } from '../types'

export type IconProps = {
  name: React.ComponentProps<typeof RawIcons_>['name']
  color?: UIColor
  size?: number
  align?: 'left' | 'right' | 'center'
}

export type IconArgs = {
  x: IconProps
  env: UIEnv
}

const getRawProps = ({
  x: props,
  env,
}: IconArgs): React.ComponentProps<typeof RawIcons_> => ({
  name: props.name,
  size: props.size ?? 24,
  color: Color.toHex((props.color ?? env.context.textColor)(env)),
  style: { textAlign: props.align },
})

const MaterialCommunityIcons_ = (args: IconArgs) =>
  React.createElement(RawIcons_, getRawProps(args))

export const MaterialCommunityIcons =
  (props: IconProps): UIElement =>
  // eslint-disable-next-line react/display-name
  env =>
    React.createElement(MaterialCommunityIcons_, { x: props, env })

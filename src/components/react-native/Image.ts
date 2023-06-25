import React from 'react'
import { Image as RNImage_ } from 'react-native'
import { UIEnv } from 'src/services/UI'
import { UIElement } from '../types'

export type ImageStyleProps = {
  w?: number
  h?: number
}

export type ImageProps = ImageStyleProps & {
  src: { type: 'base64'; base64: string }
}

export type ImageArgs = {
  x: ImageProps
  env: UIEnv
}

const getRawProps = ({
  x: props,
  env: _env,
}: ImageArgs): React.ComponentProps<typeof RNImage_> => ({
  source: { uri: 'data:image/png;base64,' + props.src.base64 },
  style: { width: props.w, height: props.h },
})

const Image_ = (args: ImageArgs) =>
  React.createElement(RNImage_, getRawProps(args))

export const Image =
  (props: ImageProps): UIElement =>
  // eslint-disable-next-line react/display-name
  env =>
    React.createElement(Image_, { x: props, env })

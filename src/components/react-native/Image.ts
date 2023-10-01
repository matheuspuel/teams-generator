import React from 'react'
import { Image as RNImage_ } from 'react-native'
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
}

const getRawProps = ({
  x: props,
}: ImageArgs): React.ComponentProps<typeof RNImage_> => ({
  source: { uri: 'data:image/png;base64,' + props.src.base64 },
  style: { width: props.w, height: props.h },
})

const Image_ = (args: ImageArgs) =>
  React.createElement(RNImage_, getRawProps(args))

export const Image = (props: ImageProps): UIElement =>
  React.createElement(Image_, { x: props })

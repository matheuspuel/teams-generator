import React from 'react'
import { Image as Image_ } from 'src/components/custom'
import { ImageProps } from 'src/components/custom/react-native/Image'

export const Image =
  <R>(props: ImageProps<R>) =>
  // eslint-disable-next-line react/display-name
  (env: R) =>
    React.createElement(Image_, { x: props, env })

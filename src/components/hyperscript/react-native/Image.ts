import { Image as Image_ } from 'src/components/custom'
import { ImageProps } from 'src/components/custom/react-native/Image'

export const Image =
  <R>(props: ImageProps<R>) =>
  (env: R) =>
    Image_({ x: props, env })

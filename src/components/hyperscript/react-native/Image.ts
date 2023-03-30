import { Image as Image_ } from 'src/components/custom2'
import { ImageProps } from 'src/components/custom2/react-native/Image'

export const Image =
  <R>(props: ImageProps<R>) =>
  (env: R) =>
    Image_({ x: props, env })

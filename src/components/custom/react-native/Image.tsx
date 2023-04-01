import { Image as Image_ } from 'react-native'

export type ImageStyleProps<R> = {
  w?: number
  h?: number
}

export type ImageProps<R> = ImageStyleProps<R> & {
  src: { type: 'base64'; base64: string }
}

export type ImageArgs<R> = {
  x: ImageProps<R>
  env: R
}

const getRawProps = <R,>({
  x: props,
  env,
}: ImageArgs<R>): React.ComponentProps<typeof Image_> => ({
  source: { uri: 'data:image/png;base64,' + props.src.base64 },
  style: { width: props.w, height: props.h },
})

export const Image = <R,>(args: ImageArgs<R>) => (
  <Image_ {...getRawProps(args)} />
)

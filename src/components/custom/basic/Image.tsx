import { Image as Image_ } from 'react-native'

type ImageProps = {
  src: { type: 'base64'; base64: string }
  w?: number
  h?: number
}

export const Image = ({ x: props }: { x: ImageProps }) => (
  <Image_
    {...{
      source: { uri: 'data:image/png;base64,' + props.src.base64 },
      style: { width: props.w, height: props.h },
    }}
  />
)

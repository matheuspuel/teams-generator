import { Text } from 'react-native'
import { Color, toHex } from 'src/utils/Color'
import {
  MarginProps,
  PaddingProps,
  toDescriptiveMarginProps,
  toDescriptivePaddingProps,
} from './View'

type TxtProps = PaddingProps &
  MarginProps & {
    flex?: number
    color?: Color
    align?: 'center' | 'left' | 'right' | 'justify'
    size?: number
    lineHeight?: number
    weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
    numberOfLines?: number
    w?: number
    h?: number
    children: string
  }

export const Txt = (props: TxtProps) => (
  <Text
    {...{
      style: {
        ...toDescriptivePaddingProps(props),
        ...toDescriptiveMarginProps(props),
        flex: props?.flex,
        color: props?.color ? toHex(props.color) : undefined,
        textAlign: props?.align,
        fontSize: props?.size,
        fontWeight: props?.weight ? `${props.weight}` : undefined,
        lineHeight: props?.lineHeight,
        width: props?.w,
        height: props?.h,
      },
      numberOfLines: props?.numberOfLines,
      children: props.children,
    }}
  />
)

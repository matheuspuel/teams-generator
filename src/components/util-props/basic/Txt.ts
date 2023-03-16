import {
  MarginProps,
  PaddingProps,
  toDescriptiveMarginProps,
  toDescriptivePaddingProps,
} from 'src/components/custom/basic/View'
import { Text } from 'src/components/hyperscript/reactNative'
import { Color, toHex } from 'src/utils/datatypes/Color'

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
  }

export const Txt = (props?: TxtProps) => (text: string) =>
  Text({
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
  })([() => text])

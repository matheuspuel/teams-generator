import { Text } from 'react-native'
import { defaultColors } from 'src/services/Theme/default'
import { Color, toHex } from 'src/utils/datatypes/Color'
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
  }

export const Txt = ({
  x: props,
  children,
}: {
  x?: TxtProps
  children: string
}) => (
  <Text
    {...{
      style: {
        ...toDescriptivePaddingProps(props),
        ...toDescriptiveMarginProps(props),
        flex: props?.flex,
        color: toHex(props?.color ?? defaultColors.text.dark),
        textAlign: props?.align,
        fontSize: props?.size,
        fontWeight: props?.weight ? `${props.weight}` : undefined,
        lineHeight: props?.lineHeight,
        width: props?.w,
        height: props?.h,
      },
      numberOfLines: props?.numberOfLines,
      children: children,
    }}
  />
)

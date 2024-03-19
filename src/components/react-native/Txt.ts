import * as React from 'react'
import { Text as RawText } from 'react-native'
import {
  MarginProps,
  PaddingProps,
  UIColor,
  UIElement,
} from 'src/components/types'
import { useTextStyle } from 'src/contexts/TextStyle'
import { useThemeGetRawColor } from 'src/contexts/Theme'
import { named2 } from '../hyperscript'

export type TextStyleProps = PaddingProps &
  MarginProps & {
    flex?: number
    color?: UIColor
    align?: 'left' | 'center' | 'right' | 'justify'
    size?: number
    lineHeight?: number
    includeFontPadding?: boolean
    weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
    numberOfLines?: number
    w?: number
    h?: number
  }

export type TextProps = TextStyleProps

export const Txt = named2('Txt')((props?: TextProps) =>
  // eslint-disable-next-line react/display-name
  (children: string): UIElement => {
    const textStyle = useTextStyle()
    const getRawColor = useThemeGetRawColor()
    return React.createElement(
      RawText,
      {
        numberOfLines: props?.numberOfLines,
        style: {
          padding: props?.p,
          paddingHorizontal: props?.px,
          paddingVertical: props?.py,
          paddingLeft: props?.pl,
          paddingRight: props?.pr,
          paddingTop: props?.pt,
          paddingBottom: props?.pb,
          margin: props?.m,
          marginHorizontal: props?.mx,
          marginVertical: props?.my,
          marginLeft: props?.ml,
          marginRight: props?.mr,
          marginTop: props?.mt,
          marginBottom: props?.mb,
          width: props?.w,
          height: props?.h,
          flex: props?.flex,
          color: getRawColor(props?.color ?? textStyle.color),
          textAlign: props?.align ?? 'center',
          fontSize: props?.size,
          fontWeight: props?.weight ? `${props.weight}` : undefined,
          lineHeight: props?.lineHeight,
          includeFontPadding: props?.includeFontPadding,
        },
      },
      children,
    )
  },
)

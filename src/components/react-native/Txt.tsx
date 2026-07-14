import { Text as RawText } from 'react-native'
import type { MarginProps, PaddingProps, UIColor } from 'src/components/types'
import { useTextStyle } from 'src/contexts/TextStyle'
import { useThemeGetRawColor } from 'src/contexts/Theme'

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

export type TextProps = TextStyleProps & {
  children: string
}

export const Txt = (props: TextProps) => {
  const textStyle = useTextStyle()
  const getRawColor = useThemeGetRawColor()
  return (
    <RawText
      numberOfLines={props.numberOfLines}
      style={{
        padding: props.p,
        paddingHorizontal: props.px,
        paddingVertical: props.py,
        paddingLeft: props.pl,
        paddingRight: props.pr,
        paddingTop: props.pt,
        paddingBottom: props.pb,
        margin: props.m,
        marginHorizontal: props.mx,
        marginVertical: props.my,
        marginLeft: props.ml,
        marginRight: props.mr,
        marginTop: props.mt,
        marginBottom: props.mb,
        width: props.w,
        height: props.h,
        flex: props.flex,
        color: getRawColor(props.color ?? textStyle.color),
        textAlign: props.align ?? 'center',
        fontSize: props.size,
        fontWeight: props.weight ? `${props.weight}` : undefined,
        lineHeight: props.lineHeight,
        includeFontPadding: props.includeFontPadding,
      }}
      children={props.children}
    />
  )
}

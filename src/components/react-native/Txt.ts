import React from 'react'
import { Text as RawText } from 'react-native'
import {
  MarginProps,
  PaddingProps,
  UIColor,
  UIElement,
} from 'src/components/types'
import { useRuntime } from 'src/contexts/Runtime'
import { TextStyleContext, useTextStyle } from 'src/contexts/TextStyle'
import { AppRuntime } from 'src/runtime'
import { Color } from 'src/utils/datatypes'
import { Runtime } from 'src/utils/fp'
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

const getRawProps = ({
  props,
  runtime,
  textStyle,
}: {
  props?: TextProps
  runtime: AppRuntime
  textStyle: TextStyleContext
}): React.ComponentProps<typeof RawText> => ({
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
    color: Color.toHex(
      Runtime.runSync(runtime)(props?.color ?? textStyle.color),
    ),
    textAlign: props?.align ?? 'center',
    fontSize: props?.size,
    fontWeight: props?.weight ? `${props.weight}` : undefined,
    lineHeight: props?.lineHeight,
    includeFontPadding: props?.includeFontPadding,
  },
})

export const Txt = named2('Txt')((props?: TextProps) =>
  // eslint-disable-next-line react/display-name
  (children: string): UIElement => {
    const runtime = useRuntime()
    const textStyle = useTextStyle()
    return React.createElement(
      RawText,
      getRawProps({ props, runtime, textStyle }),
      children,
    )
  },
)

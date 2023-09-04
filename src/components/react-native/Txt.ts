import React from 'react'
import { Text as RawText } from 'react-native'
import {
  MarginProps,
  PaddingProps,
  UIColor,
  UIElement,
} from 'src/components/types'
import { UIEnv } from 'src/services/UI'
import { Color } from 'src/utils/datatypes'

export type TextStyleProps = PaddingProps &
  MarginProps & {
    flex?: number
    color?: UIColor
    align?: 'center' | 'left' | 'right' | 'justify'
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
  env,
}: {
  props?: TextProps
  env: UIEnv
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
    color: Color.toHex((props?.color ?? env.context.textColor)(env)),
    textAlign: props?.align ?? 'center',
    fontSize: props?.size,
    fontWeight: props?.weight ? `${props.weight}` : undefined,
    lineHeight: props?.lineHeight,
    includeFontPadding: props?.includeFontPadding,
  },
})

export const Txt =
  (props?: TextProps) =>
  (children: string): UIElement =>
  // eslint-disable-next-line react/display-name
  env =>
    React.createElement(RawText, getRawProps({ props, env }), children)

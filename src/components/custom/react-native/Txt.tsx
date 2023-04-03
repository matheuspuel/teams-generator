import { Reader } from 'fp-ts/lib/Reader'
import { Text as Text_ } from 'react-native'
import { Color } from 'src/utils/datatypes'
import { MarginProps, PaddingProps } from '../types'

export type TextStyleProps<R> = PaddingProps &
  MarginProps & {
    flex?: number
    color?: Reader<R, Color>
    align?: 'center' | 'left' | 'right' | 'justify'
    size?: number
    lineHeight?: number
    includeFontPadding?: boolean
    weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
    numberOfLines?: number
    w?: number
    h?: number
  }

export type TextProps<R> = TextStyleProps<R>

export type TextArgs<R> = {
  x?: TextProps<R>
  children?: string
  env: R
}

const getRawProps = <R,>({
  x: props,
  children,
  env,
}: TextArgs<R>): React.ComponentProps<typeof Text_> => ({
  children: children,
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
    color: props?.color ? Color.toHex(props.color(env)) : undefined,
    textAlign: props?.align,
    fontSize: props?.size,
    fontWeight: props?.weight ? `${props.weight}` : undefined,
    lineHeight: props?.lineHeight,
    includeFontPadding: props?.includeFontPadding,
  },
})

export const Txt = <R,>(args: TextArgs<R>) => <Text_ {...getRawProps(args)} />

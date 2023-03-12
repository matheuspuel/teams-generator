import { View as View_ } from 'src/components/hyperscript/reactNative'
import { Color, toHex } from 'src/utils/Color'
import { $, Reader, ReaderIO } from 'src/utils/fp'

type DirectionName =
  | ''
  | 'Horizontal'
  | 'Vertical'
  | 'Left'
  | 'Right'
  | 'Top'
  | 'Bottom'

type DirectionToken = '' | 'x' | 'y' | 'l' | 'r' | 't' | 'b'

type Spacing = number

type LineWidth = number

type DescriptivePaddingProps = {
  [k in `padding${DirectionName}`]?: number
}

export type PaddingProps = {
  [k in `p${DirectionToken}`]?: Spacing
}

export const toDescriptivePaddingProps = (
  props?: PaddingProps,
): DescriptivePaddingProps => ({
  padding: props?.p,
  paddingHorizontal: props?.px,
  paddingVertical: props?.py,
  paddingLeft: props?.pl,
  paddingRight: props?.pr,
  paddingTop: props?.pt,
  paddingBottom: props?.pb,
})

type DescriptiveMarginProps = {
  [k in `margin${DirectionName}`]?: number
}

export type MarginProps = {
  [k in `m${DirectionToken}`]?: Spacing
}

export const toDescriptiveMarginProps = (
  props?: MarginProps,
): DescriptiveMarginProps => ({
  margin: props?.m,
  marginHorizontal: props?.mx,
  marginVertical: props?.my,
  marginLeft: props?.ml,
  marginRight: props?.mr,
  marginTop: props?.mt,
  marginBottom: props?.mb,
})

export type BorderWidthProps = {
  [k in `borderWidth${Uppercase<DirectionToken>}`]?: LineWidth
}

export const toDescriptiveBorderWidthProps = (props?: BorderWidthProps) => ({
  borderWidth: props?.borderWidth,
  borderLeftWidth: props?.borderWidthL ?? props?.borderWidthX,
  borderRightWidth: props?.borderWidthR ?? props?.borderWidthX,
  borderTopWidth: props?.borderWidthT ?? props?.borderWidthY,
  borderBottomWidth: props?.borderWidthB ?? props?.borderWidthY,
})

export type RoundProps = {
  round?: number
  roundTL?: number
  roundTR?: number
  roundBL?: number
  roundBR?: number
} & (
  | { roundL?: number; roundR?: number; roundT?: never; roundB?: never }
  | { roundL?: never; roundR?: never; roundT?: number; roundB?: number }
)

export const toDescriptiveRoundProps = (props?: RoundProps) => ({
  borderRadius: props?.round,
  borderTopLeftRadius: props?.roundTL ?? props?.roundT ?? props?.roundL,
  borderTopRightRadius: props?.roundTR ?? props?.roundT ?? props?.roundR,
  borderBottomLeftRadius: props?.roundBL ?? props?.roundB ?? props?.roundL,
  borderBottomRightRadius: props?.roundBR ?? props?.roundB ?? props?.roundR,
})

export type ViewStyleProps = PaddingProps &
  MarginProps &
  BorderWidthProps &
  RoundProps & {
    w?: number
    h?: number
    aspectRatio?: number
    flex?: number
    direction?: 'row' | 'column'
    justify?:
      | 'center'
      | 'start'
      | 'end'
      | 'space-between'
      | 'space-around'
      | 'space-evenly'
    align?: 'start' | 'end' | 'center' | 'stretch'
    alignSelf?: 'start' | 'end' | 'center' | 'stretch'
    shadow?: number
    bg?: Color
    borderColor?: Color
    absolute?:
      | false
      | { left?: number; right?: number; top?: number; bottom?: number }
  }

export type ViewProps<R> = ViewStyleProps & {
  key?: string
  onLayout?: ReaderIO<R, void>
}

export type ViewDescriptiveStyleProp = DescriptivePaddingProps &
  DescriptiveMarginProps & {
    flex?: number
    flexDirection?: 'column' | 'row'
    justifyContent?:
      | 'center'
      | 'flex-start'
      | 'flex-end'
      | 'space-between'
      | 'space-around'
      | 'space-evenly'
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch'
    alignSelf?: 'flex-start' | 'flex-end' | 'center' | 'stretch'
    borderRadius?: number
    elevation?: number
    backgroundColor?: string
    borderColor?: string
    width?: number
    height?: number
    aspectRatio?: number
  }

export const getViewStyleProp = (
  props?: ViewStyleProps,
): ViewDescriptiveStyleProp => ({
  ...toDescriptivePaddingProps(props),
  ...toDescriptiveMarginProps(props),
  ...toDescriptiveBorderWidthProps(props),
  ...toDescriptiveRoundProps(props),
  borderRadius: props?.round,
  width: props?.w,
  height: props?.h,
  aspectRatio: props?.aspectRatio,
  flex: props?.flex,
  flexDirection: props?.direction,
  backgroundColor: props?.bg ? toHex(props.bg) : undefined,
  borderColor: props?.borderColor ? toHex(props.borderColor) : undefined,
  justifyContent:
    props?.justify === 'start'
      ? 'flex-start'
      : props?.justify === 'end'
      ? 'flex-end'
      : props?.justify,
  alignItems:
    props?.align === 'start'
      ? 'flex-start'
      : props?.align === 'end'
      ? 'flex-end'
      : props?.align,
  alignSelf:
    props?.alignSelf === 'start'
      ? 'flex-start'
      : props?.alignSelf === 'end'
      ? 'flex-end'
      : props?.alignSelf,
  elevation: props?.shadow,
  ...$(
    props?.absolute
      ? { ...props.absolute, position: 'absolute' }
      : props?.absolute === false
      ? { position: 'relative' }
      : undefined,
  ),
})

export const View =
  <R1>(props?: ViewProps<R1>) =>
  <R2>(children: ReadonlyArray<Reader<R2, React.ReactElement>>) =>
  (env: R1 & R2) =>
    View_({
      key: props?.key,
      style: getViewStyleProp(props),
      onLayout: props?.onLayout?.(env),
    })(children)(env)

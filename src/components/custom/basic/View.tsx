import { $, IO } from 'fp'
import { View as View_ } from 'react-native'
import { Color, toHex } from 'src/utils/datatypes/Color'

export type Elements = React.ReactElement | ReadonlyArray<React.ReactElement>

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
    gap?: number
    gapX?: number
    gapY?: number
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

export type ViewProps = ViewStyleProps & {
  onLayout?: IO<void>
}

export type ViewDescriptiveStyleProp = DescriptivePaddingProps &
  DescriptiveMarginProps & {
    gap?: number
    rowGap?: number
    columnGap?: number
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
  gap: props?.gap,
  rowGap: props?.gapX,
  columnGap: props?.gapY,
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

export const View = ({
  x: props,
  children,
}: {
  x: ViewProps
  children: Elements
}) => (
  <View_
    {...{
      style: getViewStyleProp(props),
      onLayout: props?.onLayout,
      children: children,
    }}
  />
)

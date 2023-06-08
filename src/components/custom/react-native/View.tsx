import { $, Eff, Reader } from 'fp'
import React from 'react'
import { View as View_ } from 'react-native'
import { Event, EventHandlerEnv } from 'src/actions'
import { Color } from 'src/utils/datatypes'
import {
  AbsolutePositionProps,
  BorderWidthProps,
  FlexChildProps,
  FlexContainerProps,
  GapProps,
  JSXElementsChildren,
  MarginProps,
  PaddingProps,
  RoundProps,
} from '../types'

export type ViewStyleProps<R> = PaddingProps &
  MarginProps &
  BorderWidthProps &
  RoundProps &
  GapProps &
  FlexContainerProps &
  FlexChildProps &
  AbsolutePositionProps & {
    key?: string
    w?: number
    h?: number
    aspectRatio?: number
    overflow?: 'visible' | 'hidden'
    shadow?: number
    zIndex?: number
    bg?: Reader<R, Color>
    borderColor?: Reader<R, Color>
  }

export type ViewProps<
  R,
  E1 extends Event<string, unknown> = Event<never, never>,
> = ViewStyleProps<R> & {
  onLayout?: E1
}

export type ViewArgs<
  R,
  E1 extends Event<string, unknown> = Event<never, never>,
> = {
  x: ViewProps<R, E1>
  children?: JSXElementsChildren
  env: R & EventHandlerEnv<E1>
}

const getRawProps = <
  R,
  E1 extends Event<string, unknown> = Event<never, never>,
>({
  x: props,
  children,
  env,
}: ViewArgs<R, E1>): React.ComponentProps<typeof View_> & { key?: string } => ({
  key: props.key,
  onLayout:
    props.onLayout &&
    (() => props.onLayout && Eff.runPromise(env.eventHandler(props.onLayout))),
  children: children,
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
    borderWidth: props?.borderWidth,
    borderLeftWidth: props?.borderWidthL ?? props?.borderWidthX,
    borderRightWidth: props?.borderWidthR ?? props?.borderWidthX,
    borderTopWidth: props?.borderWidthT ?? props?.borderWidthY,
    borderBottomWidth: props?.borderWidthB ?? props?.borderWidthY,
    borderRadius: props?.round,
    borderTopLeftRadius: props?.roundTL ?? props?.roundT ?? props?.roundL,
    borderTopRightRadius: props?.roundTR ?? props?.roundT ?? props?.roundR,
    borderBottomLeftRadius: props?.roundBL ?? props?.roundB ?? props?.roundL,
    borderBottomRightRadius: props?.roundBR ?? props?.roundB ?? props?.roundR,
    gap: props?.gap,
    rowGap: props?.gapX,
    columnGap: props?.gapY,
    width: props?.w,
    height: props?.h,
    aspectRatio: props?.aspectRatio,
    flex: props?.flex,
    flexDirection: props?.direction,
    backgroundColor: props?.bg ? Color.toHex(props.bg(env)) : undefined,
    borderColor: props?.borderColor
      ? Color.toHex(props.borderColor(env))
      : undefined,
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
    zIndex: props?.zIndex,
    overflow: props?.overflow,
  },
})

export const View = <
  R,
  E1 extends Event<string, unknown> = Event<never, never>,
>(
  args: ViewArgs<R, E1>,
) => <View_ {...getRawProps(args)} />

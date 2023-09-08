import { $, A, Runtime, apply } from 'fp'
import React from 'react'
import { View as RawView } from 'react-native'
import {
  AbsolutePositionProps,
  BorderWidthProps,
  Children,
  FlexChildProps,
  FlexContainerProps,
  GapProps,
  MarginProps,
  PaddingProps,
  RoundProps,
  UIColor,
  UIElement,
} from 'src/components/types'
import { AppEvent } from 'src/events'
import { UIEnv } from 'src/services/UI'
import { Color } from 'src/utils/datatypes'

export type ViewStyleProps = PaddingProps &
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
    bg?: UIColor
    borderColor?: UIColor
  }

export type ViewProps = ViewStyleProps & {
  onLayout?: AppEvent
}

const getRawProps = ({
  props,
  env,
}: {
  props: ViewProps
  env: UIEnv
}): React.ComponentProps<typeof RawView> & {
  key?: string
} => ({
  key: props.key,
  onLayout:
    props.onLayout &&
    (() => props.onLayout && Runtime.runPromise(env.runtime)(props.onLayout)),
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
    backgroundColor: props?.bg
      ? Color.toHex(Runtime.runSync(env.runtime)(props.bg))
      : undefined,
    borderColor: props?.borderColor
      ? Color.toHex(Runtime.runSync(env.runtime)(props.borderColor))
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

export const View =
  (props: ViewProps = {}) =>
  (children: Children): UIElement =>
  // eslint-disable-next-line react/display-name
  env =>
    React.createElement(
      RawView,
      getRawProps({ props, env }),
      ...$(children, A.map(apply(env))),
    )

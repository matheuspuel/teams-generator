import { Runtime, pipe } from 'fp'
import React from 'react'
import { RectButton } from 'react-native-gesture-handler'
import {
  AbsolutePositionProps,
  Children,
  FlexChildProps,
  FlexContainerProps,
  GapProps,
  JSXElementsChildren,
  MarginProps,
  PaddingProps,
  UIColor,
  UIElement,
} from 'src/components/types'
import { useRuntime } from 'src/contexts/Runtime'
import { AppEvent } from 'src/events'
import { AppRuntime } from 'src/runtime'
import { Color } from 'src/utils/datatypes'
import { named2 } from '../helpers'

export type PressableStyleProps = PaddingProps &
  MarginProps &
  GapProps &
  FlexContainerProps &
  FlexChildProps &
  AbsolutePositionProps & {
    key?: string
    round?: number
    w?: number
    h?: number
    minW?: number
    minH?: number
    aspectRatio?: number
    shadow?: number
    bg?: UIColor
    borderColor?: UIColor
  }

export type PressableProps = PressableStyleProps & {
  onPress: AppEvent
  isEnabled?: boolean
  rippleColor?: UIColor
  rippleOpacity?: number
  borderless?: boolean
  foreground?: boolean
}

export type PressableArgs = {
  x: PressableProps
  children?: JSXElementsChildren
  runtime: AppRuntime
}

const getRawProps = ({
  x: props,
  children,
  runtime,
}: PressableArgs): React.ComponentProps<typeof RectButton> => ({
  children: children,
  onPress:
    props.isEnabled !== false
      ? () => Runtime.runPromise(runtime)(props.onPress)
      : undefined,
  rippleColor:
    props.isEnabled !== false
      ? props.rippleColor
        ? pipe(
            Runtime.runSync(runtime)(props.rippleColor),
            Color.withOpacity(Math.round((props.rippleOpacity ?? 1) * 255)),
            Color.toHex,
          )
        : undefined
      : 'transparent',
  borderless: props.borderless,
  foreground: props.foreground,
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
    borderRadius: props?.round,
    gap: props?.gap,
    rowGap: props?.gapX,
    columnGap: props?.gapY,
    width: props?.w,
    height: props?.h,
    minWidth: props?.minW,
    minHeight: props?.minH,
    aspectRatio: props?.aspectRatio,
    flex: props?.flex,
    flexDirection: props?.direction,
    backgroundColor: props?.bg
      ? Color.toHex(Runtime.runSync(runtime)(props.bg))
      : undefined,
    borderColor: props?.borderColor
      ? Color.toHex(Runtime.runSync(runtime)(props.borderColor))
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
    ...pipe(
      props?.absolute
        ? { ...props.absolute, position: 'absolute' }
        : props?.absolute === false
        ? { position: 'relative' }
        : undefined,
    ),
  },
})

const Pressable_ = (args: PressableArgs) =>
  React.createElement(RectButton, getRawProps(args))

export const Pressable = named2('Pressable')((props: PressableProps) =>
  // eslint-disable-next-line react/display-name
  (children: Children): UIElement => {
    const runtime = useRuntime()
    return React.createElement(Pressable_, { x: props, runtime }, ...children)
  },
)

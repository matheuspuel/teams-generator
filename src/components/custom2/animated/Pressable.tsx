import { $, Reader, ReaderIO } from 'fp'
import React from 'react'
import { RectButton } from 'react-native-gesture-handler'
import { ViewProps } from 'src/components/custom2/react-native/View'
import { Color } from 'src/utils/datatypes'
import { JSXElementsChildren } from '../types'

export type PressableProps<R> = Omit<ViewProps<R>, 'onLayout'> & {
  onPress: ReaderIO<R, void>
  isEnabled?: boolean
  rippleColor?: Reader<R, Color>
  rippleOpacity?: number
  borderless?: boolean
  foreground?: boolean
}

export type PressableArgs<R> = {
  x: PressableProps<R>
  children?: JSXElementsChildren
  env: R
}

const getRawProps = <R extends unknown>({
  x: props,
  children,
  env,
}: PressableArgs<R>): React.ComponentProps<typeof RectButton> => ({
  children: children,
  onPress: () => props.isEnabled !== false && props.onPress(env)(),
  rippleColor:
    props.isEnabled !== false
      ? props.rippleColor
        ? $(
            props.rippleColor(env),
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
  },
})

export const Pressable = <R extends unknown>(args: PressableArgs<R>) => (
  <RectButton {...getRawProps(args)} />
)

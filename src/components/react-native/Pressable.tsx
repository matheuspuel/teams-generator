import { Runtime, pipe } from 'effect'
import * as React from 'react'
import { BorderlessButton, RectButton } from 'react-native-gesture-handler'
import {
  AbsolutePositionProps,
  FlexChildProps,
  FlexContainerProps,
  GapProps,
  MarginProps,
  PaddingProps,
  UIColor,
} from 'src/components/types'
import { useRuntime } from 'src/contexts/Runtime'
import { useThemeGetRawColor } from 'src/contexts/Theme'
import { AppEvent } from 'src/runtime'
import { Colors } from 'src/services/Theme'

export type PressableStyleProps = PaddingProps &
  MarginProps &
  GapProps &
  FlexContainerProps &
  FlexChildProps &
  AbsolutePositionProps & {
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
  children: React.ReactNode
}

export const Pressable = (props: PressableProps) => {
  const runtime = useRuntime()
  const getRawColor = useThemeGetRawColor()
  const Component = props.borderless ? BorderlessButton : RectButton
  return (
    <Component
      children={props.children}
      onPress={
        props.isEnabled !== false
          ? () => void Runtime.runPromise(runtime)(props.onPress)
          : undefined
      }
      rippleColor={
        props.isEnabled !== false
          ? props.rippleColor
            ? getRawColor(
                Colors.opacity(props.rippleOpacity ?? 1)(props.rippleColor),
              )
            : undefined
          : 'transparent'
      }
      activeOpacity={props.isEnabled !== false ? props.rippleOpacity : 0}
      underlayColor={
        props.rippleColor ? getRawColor(props.rippleColor) : undefined
      }
      borderless={props.borderless}
      foreground={props.foreground}
      style={{
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
        flexGrow: props?.flexGrow,
        flexShrink: props?.flexShrink,
        flexDirection: props?.direction,
        backgroundColor: props?.bg ? getRawColor(props.bg) : undefined,
        borderColor: props?.borderColor
          ? getRawColor(props.borderColor)
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
      }}
    />
  )
}

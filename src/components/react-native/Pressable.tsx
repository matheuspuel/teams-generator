import { pipe } from 'effect'
import * as React from 'react'
import { BorderlessButton, RectButton } from 'react-native-gesture-handler'
import type {
  AbsolutePositionProps,
  FlexChildProps,
  FlexContainerProps,
  GapProps,
  MarginProps,
  PaddingProps,
} from 'src/components/types'
import type { Color } from 'src/utils/datatypes/Color'

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
    bg?: Color
    borderColor?: Color
  }

export type PressableProps = PressableStyleProps & {
  onPress: () => void
  isEnabled?: boolean
  rippleColor?: Color
  rippleOpacity?: number
  borderless?: boolean
  foreground?: boolean
  children: React.ReactNode
}

export const Pressable = (props: PressableProps) => {
  const Component = props.borderless ? BorderlessButton : RectButton
  return (
    <Component
      children={props.children}
      onPress={props.isEnabled !== false ? props.onPress : undefined}
      rippleColor={
        props.isEnabled !== false
          ? props.rippleColor
              ?.setOpacityFactor(props.rippleOpacity ?? 1)
              .toHex()
          : 'transparent'
      }
      activeOpacity={props.isEnabled !== false ? props.rippleOpacity : 0}
      underlayColor={props.rippleColor?.toHex()}
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
        backgroundColor: props?.bg?.toHex(),
        borderColor: props?.borderColor?.toHex(),
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

import { $, ReaderIO, Rec } from 'fp'
import { Pressable as Pressable_ } from 'react-native'
import { PressableStateCallbackType } from 'react-native/types'
import { Color } from 'src/utils/datatypes'
import { JSXElementsChildren } from '../types'
import { ViewProps, ViewStyleProps } from './View'

export type PressableProps<R> = ViewProps<R> & {
  onPress: ReaderIO<R, void>
  pressed?: ViewStyleProps<R>
  isEnabled?: boolean
}

export type PressableArgs<R> = {
  x: PressableProps<R>
  children?:
    | JSXElementsChildren
    | ((state: PressableStateCallbackType) => JSXElementsChildren)
  env: R
}

const merge = Rec.getUnionSemigroup({
  concat: (a, b) => (b === undefined ? a : b),
}).concat

const getRawProps = <R extends unknown>({
  x: props,
  children,
  env,
}: PressableArgs<R>): React.ComponentProps<typeof Pressable_> => ({
  children: children,
  onLayout: props.onLayout?.(env),
  onPress: props.onPress(env),
  disabled: props.isEnabled === false,
  style: ({ pressed }) =>
    $(
      props.pressed && pressed
        ? (merge(props, props.pressed) as typeof props)
        : props,
      props => ({
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
        borderBottomLeftRadius:
          props?.roundBL ?? props?.roundB ?? props?.roundL,
        borderBottomRightRadius:
          props?.roundBR ?? props?.roundB ?? props?.roundR,
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
      }),
    ),
})

export const Pressable = <R extends unknown>(args: PressableArgs<R>) => (
  <Pressable_ {...getRawProps(args)} />
)

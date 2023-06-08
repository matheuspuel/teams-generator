import { $, Eff, Reader } from 'fp'
import React from 'react'
import { TextInput as TextInput_ } from 'react-native-gesture-handler'
import { Event, EventHandlerEnv } from 'src/actions'
import { Color } from 'src/utils/datatypes'
import {
  BorderWidthProps,
  FlexChildProps,
  MarginProps,
  PaddingProps,
  RoundProps,
} from '../types'

export type TextInputStyleProps<R> = PaddingProps &
  MarginProps &
  BorderWidthProps &
  RoundProps &
  FlexChildProps & {
    w?: number
    h?: number
    bg?: Reader<R, Color>
    borderColor?: Reader<R, Color>
    fontColor?: Reader<R, Color>
    fontSize?: number
  }

export type TextInputProps<
  R,
  E1 extends Event<string, unknown>,
  E2 extends Event<string, unknown> = Event<never, never>,
  E3 extends Event<string, unknown> = Event<never, never>,
> = TextInputStyleProps<R> & {
  value: string
  onChange: (value: string) => E1
  onFocus?: E2
  onBlur?: E3
  autoFocus?: boolean
  placeholder?: string
  placeholderTextColor?: Reader<R, Color>
  cursorColor?: Reader<R, Color>
  focused?: {
    bg?: Reader<R, Color>
    borderColor?: Reader<R, Color>
  }
}

export type TextInputArgs<
  R,
  E1 extends Event<string, unknown>,
  E2 extends Event<string, unknown> = Event<never, never>,
  E3 extends Event<string, unknown> = Event<never, never>,
> = {
  x: TextInputProps<R, E1, E2, E3>
  env: R & EventHandlerEnv<E1 | E2 | E3>
}

const getRawProps =
  (state: {
    isFocused: boolean
    setIsFocused: React.Dispatch<React.SetStateAction<boolean>>
  }) =>
  <
    R,
    E1 extends Event<string, unknown>,
    E2 extends Event<string, unknown> = Event<never, never>,
    E3 extends Event<string, unknown> = Event<never, never>,
  >({
    x: props,
    env,
  }: TextInputArgs<R, E1, E2, E3>): React.ComponentProps<
    typeof TextInput_
  > => ({
    value: props.value,
    onChangeText: t => void Eff.runPromise(env.eventHandler(props.onChange(t))),
    onFocus: () => (
      state.setIsFocused(true),
      props.onFocus
        ? void Eff.runPromise(env.eventHandler(props.onFocus))
        : undefined
    ),
    onBlur: () => (
      state.setIsFocused(false),
      props.onBlur
        ? void Eff.runPromise(env.eventHandler(props.onBlur))
        : undefined
    ),
    autoFocus: props.autoFocus,
    placeholder: props.placeholder,
    placeholderTextColor: props.placeholderTextColor
      ? Color.toHex(props.placeholderTextColor(env))
      : undefined,
    cursorColor: props.cursorColor
      ? Color.toHex(props.cursorColor(env))
      : undefined,
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
      width: props?.w,
      height: props?.h,
      flex: props?.flex,
      backgroundColor: $(
        (state.isFocused && props.focused?.bg) || props.bg,
        getColor => getColor && Color.toHex(getColor(env)),
      ),
      borderColor: $(
        (state.isFocused && props.focused?.borderColor) || props.borderColor,
        getColor => getColor && Color.toHex(getColor(env)),
      ),
      alignSelf:
        props?.alignSelf === 'start'
          ? 'flex-start'
          : props?.alignSelf === 'end'
          ? 'flex-end'
          : props?.alignSelf,
    },
  })

export const TextInput = <
  R,
  E1 extends Event<string, unknown>,
  E2 extends Event<string, unknown> = Event<never, never>,
  E3 extends Event<string, unknown> = Event<never, never>,
>(
  args: TextInputArgs<R, E1, E2, E3>,
) => {
  const [isFocused, setIsFocused] = React.useState(false)
  return <TextInput_ {...getRawProps({ isFocused, setIsFocused })(args)} />
}

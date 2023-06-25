import { $, Eff } from 'fp'
import React from 'react'
import { TextInput as RNTextInput_ } from 'react-native-gesture-handler'
import {
  BorderWidthProps,
  FlexChildProps,
  MarginProps,
  PaddingProps,
  RoundProps,
  UIColor,
  UIElement,
} from 'src/components/types'
import { AppEvent } from 'src/events'
import { UIEnv } from 'src/services/UI'
import { Color } from 'src/utils/datatypes'

export type TextInputStyleProps = PaddingProps &
  MarginProps &
  BorderWidthProps &
  RoundProps &
  FlexChildProps & {
    w?: number
    h?: number
    bg?: UIColor
    borderColor?: UIColor
    fontColor?: UIColor
    fontSize?: number
  }

export type TextInputProps = TextInputStyleProps & {
  value: string
  onChange: (value: string) => AppEvent
  onFocus?: AppEvent
  onBlur?: AppEvent
  autoFocus?: boolean
  placeholder?: string
  placeholderTextColor?: UIColor
  cursorColor?: UIColor
  focused?: {
    bg?: UIColor
    borderColor?: UIColor
  }
}

export type TextInputArgs = {
  x: TextInputProps
  env: UIEnv
}

const getRawProps =
  (state: {
    isFocused: boolean
    setIsFocused: React.Dispatch<React.SetStateAction<boolean>>
  }) =>
  ({
    x: props,
    env,
  }: TextInputArgs): React.ComponentProps<typeof RNTextInput_> => ({
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

const TextInput_ = (args: TextInputArgs) => {
  const [isFocused, setIsFocused] = React.useState(false)
  return React.createElement(
    RNTextInput_,
    getRawProps({ isFocused, setIsFocused })(args),
  )
}

export const TextInput =
  (props: TextInputProps): UIElement =>
  // eslint-disable-next-line react/display-name
  env =>
    React.createElement(TextInput_, { x: props, env })
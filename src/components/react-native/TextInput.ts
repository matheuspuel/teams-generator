import { pipe, Runtime } from 'fp'
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
import { useRuntime } from 'src/contexts/Runtime'
import { AppEvent } from 'src/events'
import { AppRuntime } from 'src/runtime'
import { Color } from 'src/utils/datatypes'
import { named } from '../helpers'

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
  ref?: React.RefObject<RNTextInput_>
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
  runtime: AppRuntime
}

const getRawProps =
  (state: {
    isFocused: boolean
    setIsFocused: React.Dispatch<React.SetStateAction<boolean>>
  }) =>
  ({
    x: props,
    runtime,
  }: TextInputArgs): React.ComponentProps<typeof RNTextInput_> => ({
    value: props.value,
    onChangeText: t => void Runtime.runSync(runtime)(props.onChange(t)),
    onFocus: () => {
      // eslint-disable-next-line functional/no-expression-statements
      state.setIsFocused(true)
      // eslint-disable-next-line functional/no-expression-statements
      props.onFocus
        ? void Runtime.runPromise(runtime)(props.onFocus)
        : undefined
    },
    onBlur: () => {
      // eslint-disable-next-line functional/no-expression-statements
      state.setIsFocused(false)
      // eslint-disable-next-line functional/no-expression-statements
      props.onBlur ? void Runtime.runPromise(runtime)(props.onBlur) : undefined
    },
    ref: props.ref,
    autoFocus: props.autoFocus,
    placeholder: props.placeholder,
    placeholderTextColor: props.placeholderTextColor
      ? Color.toHex(Runtime.runSync(runtime)(props.placeholderTextColor))
      : undefined,
    cursorColor: props.cursorColor
      ? Color.toHex(Runtime.runSync(runtime)(props.cursorColor))
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
      backgroundColor: pipe(
        (state.isFocused && props.focused?.bg) || props.bg,
        getColor => getColor && Color.toHex(Runtime.runSync(runtime)(getColor)),
      ),
      borderColor: pipe(
        (state.isFocused && props.focused?.borderColor) || props.borderColor,
        getColor => getColor && Color.toHex(Runtime.runSync(runtime)(getColor)),
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

export const TextInput = named('TextInput')((
  props: TextInputProps,
): UIElement => {
  const runtime = useRuntime()
  return React.createElement(TextInput_, { x: props, runtime })
})

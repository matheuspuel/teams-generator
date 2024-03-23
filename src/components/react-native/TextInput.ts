import { pipe, Runtime } from 'effect'
import * as React from 'react'
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
import { useThemeGetRawColor } from 'src/contexts/Theme'
import { AppEvent, AppRuntime } from 'src/runtime'
import { named } from '../hyperscript'

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
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  align?: 'left' | 'center' | 'right' | 'justify' | 'auto'
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
  getRawColor: (color: UIColor) => string
}

const getRawProps =
  (state: {
    isFocused: boolean
    setIsFocused: React.Dispatch<React.SetStateAction<boolean>>
  }) =>
  ({
    x: props,
    runtime,
    getRawColor,
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
    autoCapitalize: props.autoCapitalize,
    placeholder: props.placeholder,
    placeholderTextColor: props.placeholderTextColor
      ? getRawColor(props.placeholderTextColor)
      : undefined,
    cursorColor: props.cursorColor ? getRawColor(props.cursorColor) : undefined,
    style: {
      color: props.fontColor ? getRawColor(props.fontColor) : undefined,
      textAlign: props.align,
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
      flexGrow: props?.flexGrow,
      flexShrink: props?.flexShrink,
      backgroundColor: pipe(
        (state.isFocused && props.focused?.bg) || props.bg,
        c => c && getRawColor(c),
      ),
      borderColor: pipe(
        (state.isFocused && props.focused?.borderColor) || props.borderColor,
        c => c && getRawColor(c),
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
  const getRawColor = useThemeGetRawColor()
  return React.createElement(TextInput_, { x: props, runtime, getRawColor })
})

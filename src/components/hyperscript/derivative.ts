import { $, IO } from 'fp'
import React, { useState } from 'react'
import {
  PressableStateCallbackType,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native'
import { theme } from 'src/theme'
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from './reactNative'

export const Row: typeof View = props =>
  View({ ...props, style: [{ flexDirection: 'row' }, props?.style] })

export const Card: typeof View = props =>
  View({
    ...props,
    style: [
      {
        backgroundColor: theme.colors.white,
        padding: 8,
        margin: 4,
        borderRadius: 4,
        elevation: 2,
      },
      props?.style,
    ],
  })

export const Txt = (props?: Parameters<typeof Text>[0]) => (text: string) =>
  Text(props)([() => text])

export const ButtonPressable = (props: {
  onPress: IO<void>
  color?: string
  style?:
    | StyleProp<ViewStyle>
    | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>)
  isDisabled?: boolean
}) =>
  Pressable({
    style: ({ pressed }) => [
      {
        alignItems: 'center',
        padding: 12,
        borderRadius: 4,
        minWidth: 40,
        backgroundColor: $(
          props.color ?? theme.colors.primary[500],
          baseColor =>
            $(
              props.isDisabled ? '3f' : pressed ? 'bf' : 'ff',
              transparency => baseColor + transparency,
            ),
        ),
      },
      typeof props.style === 'function'
        ? props.style({ pressed })
        : props.style,
    ],
    onPress: props.isDisabled ? undefined : props.onPress,
  })

export const Button = ({
  title,
  _text,
  ...props
}: {
  title: string
  onPress: IO<void>
  color?: string
  style?:
    | StyleProp<ViewStyle>
    | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>)
  isDisabled?: boolean
  _text?: Parameters<typeof Txt>[0]
}) =>
  ButtonPressable(props)([
    Txt({
      ..._text,
      style: [{ color: theme.colors.lightText }, _text?.style],
    })(title),
  ])

export const GhostButton: typeof Button = props =>
  Button({
    ...props,
    style: ({ pressed }) => [
      {
        backgroundColor: $(
          props.color ?? theme.colors.primary[500],
          baseColor =>
            $(
              !props.isDisabled && pressed ? '1f' : '00',
              transparency => baseColor + transparency,
            ),
        ),
      },
      typeof props.style === 'function'
        ? props.style({ pressed })
        : props.style,
    ],
    _text: {
      ...props._text,
      style: [
        {
          color: $(props.color ?? theme.colors.primary[500], baseColor =>
            $(
              props.isDisabled ? '5f' : 'ff',
              transparency => baseColor + transparency,
            ),
          ),
        },
        props._text?.style,
      ],
    },
  })

const InputAdapt = ({
  onChange,
  ...otherProps
}: Omit<
  Exclude<Parameters<typeof TextInput>[0], null | undefined>,
  'onChangeText' | 'onChange' | 'onFocus' | 'onBlur' | 'style'
> & {
  value: string
  onChange: (value: string) => IO<void>
  onFocus?: IO<void>
  onBlur?: IO<void>
  style?:
    | StyleProp<TextStyle>
    | ((state: { isFocused: boolean }) => StyleProp<TextStyle>)
}) => {
  const [isFocused, setIsFocused] = useState(false)
  return TextInput({
    ...otherProps,
    onChangeText: t => onChange(t)(),
    onFocus: () => {
      // eslint-disable-next-line functional/no-expression-statement
      setIsFocused(true)
      // eslint-disable-next-line functional/no-expression-statement
      otherProps.onFocus?.()
    },
    onBlur: () => {
      // eslint-disable-next-line functional/no-expression-statement
      setIsFocused(false)
      // eslint-disable-next-line functional/no-expression-statement
      otherProps.onBlur?.()
    },
    style: [
      {
        borderWidth: 1,
        borderColor: isFocused
          ? theme.colors.primary[300]
          : theme.colors.gray[300],
        padding: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.white,
      },
      $(otherProps.style, s =>
        typeof s === 'function' ? s({ isFocused }) : s,
      ),
    ],
  })(null)
}

export const Input =
  // eslint-disable-next-line react/display-name
  (props: Parameters<typeof InputAdapt>[0]) => (_env: unknown) =>
    React.createElement(InputAdapt, props)

export const Select = (props: {
  text: string
  _text?: { style?: StyleProp<TextStyle> }
}) =>
  View({
    style: {
      borderWidth: 1,
      borderColor: theme.colors.gray[300],
      padding: 8,
      borderRadius: 4,
    },
  })([Txt(props._text)(props.text)])

export const Label: typeof Txt = props =>
  Txt({
    ...props,
    style: [
      {
        margin: 4,
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.grayText,
      },
      props?.style,
    ],
  })

export const FormField =
  (props: { title: string }) =>
  <R>(children: ReadonlyArray<(env: R) => React.ReactElement>) =>
    View({ style: { margin: 8 } })([Label()(props.title), ...children])

export const EmptyPlaceholder = (text: string) =>
  View({ style: { flex: 1, justifyContent: 'center' } })([
    Txt({ style: { textAlign: 'center', color: theme.colors.grayText } })(text),
  ])

export const LoadingPlaceholder = () =>
  View({ style: { flex: 1, justifyContent: 'center' } })([
    ActivityIndicator({ size: 'large', color: theme.colors.gray[500] }),
  ])

import { $, IO } from 'fp'
import React, { useState } from 'react'
import { StyleProp, TextStyle } from 'react-native'
import { colors } from 'src/theme'
import { toHex } from 'src/utils/Color'
import { TextInput } from './reactNative'

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
        borderColor: toHex(isFocused ? colors.primary.$2 : colors.gray.$2),
        padding: 8,
        borderRadius: 4,
        backgroundColor: toHex(colors.white),
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

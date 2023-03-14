import React from 'react'
import { TextInput } from 'react-native'
import { colors } from 'src/theme'
import { Color, toHex } from 'src/utils/Color'
import { IO, Rec } from 'src/utils/fp'
import {
  BorderWidthProps,
  MarginProps,
  PaddingProps,
  RoundProps,
  toDescriptiveBorderWidthProps,
  toDescriptiveMarginProps,
  toDescriptivePaddingProps,
  toDescriptiveRoundProps,
} from './View'

const merge = Rec.getUnionSemigroup({
  concat: (a, b) => (b === undefined ? a : b),
}).concat

type InputStyleProps = PaddingProps &
  MarginProps &
  BorderWidthProps &
  RoundProps & {
    fontSize?: number
    flex?: number
    w?: number
    h?: number
    alignSelf?: 'start' | 'end' | 'center' | 'stretch'
    bg?: Color
    borderColor?: Color
  }

const getStyleProp = (props?: InputStyleProps) =>
  ({
    ...toDescriptivePaddingProps(props),
    ...toDescriptiveMarginProps(props),
    ...toDescriptiveBorderWidthProps(props),
    ...toDescriptiveRoundProps(props),
    borderRadius: props?.round,
    width: props?.w,
    height: props?.h,
    flex: props?.flex,
    backgroundColor: props?.bg ? toHex(props.bg) : undefined,
    borderColor: props?.borderColor ? toHex(props.borderColor) : undefined,
    alignSelf:
      props?.alignSelf === 'start'
        ? 'flex-start'
        : props?.alignSelf === 'end'
        ? 'flex-end'
        : props?.alignSelf,
  } as const)

export const Input = (
  props: InputStyleProps & {
    value: string
    onChange: (value: string) => IO<void>
    onFocus?: IO<void>
    onBlur?: IO<void>
    placeholder?: string
    placeholderTextColor?: Color
    cursorColor?: Color
    focused?: InputStyleProps
  },
) => {
  const [isFocused, setIsFocused] = React.useState(false)
  return (
    <TextInput
      {...{
        value: props.value,
        onChangeText: t => props.onChange(t)(),
        onFocus: () => {
          // eslint-disable-next-line functional/no-expression-statement
          setIsFocused(true)
          // eslint-disable-next-line functional/no-expression-statement
          props.onFocus?.()
        },
        onBlur: () => {
          // eslint-disable-next-line functional/no-expression-statement
          setIsFocused(false)
          // eslint-disable-next-line functional/no-expression-statement
          props.onBlur?.()
        },
        placeholder: props.placeholder,
        placeholderTextColor: props.placeholderTextColor
          ? toHex(props.placeholderTextColor)
          : undefined,
        cursorColor: props.cursorColor ? toHex(props.cursorColor) : undefined,
        style: [
          {
            borderWidth: 1,
            borderColor: toHex(colors.gray.$2),
            padding: 8,
            borderRadius: 4,
          },
          props.focused
            ? getStyleProp(
                isFocused
                  ? merge(props, {
                      borderColor: toHex(colors.primary.$2),
                      ...props.focused,
                    })
                  : props,
              )
            : getStyleProp(props),
        ],
      }}
    />
  )
}

import { $, IO } from 'fp'
import React from 'react'
import { TextInput } from 'react-native'
import { colors } from 'src/theme'
import { Color } from 'src/utils/datatypes'
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
    fontColor?: Color
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
    backgroundColor: props?.bg ? Color.toHex(props.bg) : undefined,
    borderColor: props?.borderColor
      ? Color.toHex(props.borderColor)
      : undefined,
    alignSelf:
      props?.alignSelf === 'start'
        ? 'flex-start'
        : props?.alignSelf === 'end'
        ? 'flex-end'
        : props?.alignSelf,
    fontSize: props?.fontSize,
    color: Color.toHex(props?.fontColor ?? colors.text.dark),
  } as const)

export const Input = ({
  x: props,
}: {
  x: InputStyleProps & {
    value: string
    onChange: (value: string) => IO<void>
    onFocus?: IO<void>
    onBlur?: IO<void>
    placeholder?: string
    placeholderTextColor?: Color
    cursorColor?: Color
    focused?: InputStyleProps
    baseColor?: Color
  }
}) => {
  const [isFocused, setIsFocused] = React.useState(false)
  return (
    <TextInput
      {...{
        value: props.value,
        onChangeText: t => props.onChange(t)(),
        onFocus: () => {
          // eslint-disable-next-line functional/no-expression-statements
          setIsFocused(true)
          // eslint-disable-next-line functional/no-expression-statements
          props.onFocus?.()
        },
        onBlur: () => {
          // eslint-disable-next-line functional/no-expression-statements
          setIsFocused(false)
          // eslint-disable-next-line functional/no-expression-statements
          props.onBlur?.()
        },
        placeholder: props.placeholder,
        placeholderTextColor: props.placeholderTextColor
          ? Color.toHex(props.placeholderTextColor)
          : undefined,
        cursorColor: props.cursorColor
          ? Color.toHex(props.cursorColor)
          : undefined,
        style: $(
          {
            borderWidth: 1,
            borderColor: colors.gray.$2,
            p: 8,
            round: 4,
            ...props,
          },
          defaultProps =>
            isFocused
              ? ({
                  ...defaultProps,
                  borderColor: props.baseColor ?? colors.primary.$5,
                  bg: Color.withOpacity(31)(
                    props.baseColor ?? colors.primary.$5,
                  ),
                  ...props.focused,
                } as object)
              : defaultProps,
          getStyleProp,
          s => ({ ...s, outline: 'none' }),
        ),
      }}
    />
  )
}

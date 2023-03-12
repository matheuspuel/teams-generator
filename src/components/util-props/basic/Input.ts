import { ReaderIO } from 'fp-ts/lib/ReaderIO'
import { Input as Input_ } from 'src/components/hyperscript/derivative'
import { Color, toHex } from 'src/utils/Color'
import { Rec } from 'src/utils/fp'
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

export const Input =
  <R>(
    props: InputStyleProps & {
      value: string
      onChange: (value: string) => ReaderIO<R, void>
      placeholder?: string
      placeholderTextColor?: Color
      cursorColor?: Color
      focused?: InputStyleProps
    },
  ) =>
  (env: R) =>
    Input_({
      value: props.value,
      onChange: v => props.onChange(v)(env),
      placeholder: props.placeholder,
      placeholderTextColor: props.placeholderTextColor
        ? toHex(props.placeholderTextColor)
        : undefined,
      cursorColor: props.cursorColor ? toHex(props.cursorColor) : undefined,
      style: props.focused
        ? ({ isFocused }) =>
            getStyleProp(isFocused ? merge(props, props.focused ?? {}) : props)
        : getStyleProp(props),
    })(env)

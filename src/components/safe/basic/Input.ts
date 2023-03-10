import { Input as Input_ } from 'src/components/hyperscript/derivative'
import { ReaderIO } from 'src/utils/fp'

type InputStyle = {
  fontSize?: number
  padding?: number
  paddingHorizontal?: number
  borderWidth?: number
  borderRadius?: number
  borderColor?: string
  backgroundColor?: string
}

export const Input =
  <R>(props: {
    placeholder?: string
    value: string
    onChange: (value: string) => ReaderIO<R, void>
    placeholderTextColor?: string
    cursorColor?: string
    style?: InputStyle | ((state: { isFocused: boolean }) => InputStyle)
  }) =>
  (env: R) =>
    Input_({
      ...props,
      onChange: v => props.onChange(v)(env),
    })(env)

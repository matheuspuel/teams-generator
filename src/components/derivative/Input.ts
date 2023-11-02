import { Platform } from 'react-native'
import { Colors } from 'src/services/Theme'
import { named } from '../hyperscript'
import { TextInput, TextInputProps } from '../react-native/TextInput'
import { UIColor } from '../types'

export type InputProps = TextInputProps & {
  color?: UIColor
  isEnabled?: boolean
}

export const Input = named('Input')((props: InputProps) =>
  TextInput({
    cursorColor: Colors.primary,
    placeholderTextColor: Colors.text.gray,
    bg: Colors.card,
    fontColor: Colors.text.normal,
    fontSize: 12,
    py: Platform.OS === 'ios' ? 16.5 : 10,
    px: Platform.OS === 'ios' ? 12 : 14,
    borderWidth: 1,
    round: 4,
    ...props,
    borderColor: props.borderColor ?? Colors.opacity(0.375)(Colors.gray),
    focused: {
      bg: Colors.opacity(0.125)(props.color ?? Colors.primary),
      borderColor: props.color ?? Colors.primary,
      ...props.focused,
    },
  }),
)

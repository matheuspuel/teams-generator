import { F } from 'fp'
import { Platform } from 'react-native'
import { Colors } from 'src/services/Theme'
import { withOpacity } from 'src/utils/datatypes/Color'
import { named2 } from '../helpers'
import { TextInput, TextInputProps } from '../react-native/TextInput'
import { UIColor } from '../types'

export type InputProps = TextInputProps & {
  color?: UIColor
  isEnabled?: boolean
}

export const Input = named2('Input')((props: InputProps) =>
  TextInput({
    cursorColor: Colors.text.dark,
    placeholderTextColor: Colors.gray.$3,
    bg: Colors.white,
    fontColor: Colors.text.dark,
    fontSize: 12,
    py: Platform.OS === 'ios' ? 16.5 : 10,
    px: Platform.OS === 'ios' ? 12 : 14,
    borderWidth: 1,
    round: 4,
    ...props,
    borderColor: props.borderColor ?? Colors.gray.$2,
    focused: {
      bg: F.map(props.color ?? Colors.primary.$5, withOpacity(31)),
      borderColor: props.color ?? Colors.primary.$5,
      ...props.focused,
    },
  }),
)

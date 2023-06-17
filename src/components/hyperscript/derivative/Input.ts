import { $, R } from 'fp'
import { Reader } from 'fp-ts/Reader'
import { Platform } from 'react-native'
import { TextInputProps } from 'src/components/custom/react-native/TextInput'
import { Event } from 'src/events/helpers'
import { AppThemeEnv, Colors } from 'src/services/Theme'
import { Color } from 'src/utils/datatypes'
import { withOpacity } from 'src/utils/datatypes/Color'
import { NotAnyOrElse } from 'src/utils/types'
import { named2 } from '../../helpers'
import { TextInput } from '../react-native/TextInput'

export type InputProps<R, E extends Event> = TextInputProps<R, E> & {
  color?: Reader<R & AppThemeEnv, Color>
  isEnabled?: boolean
}

export const Input = named2('Input')(
  <R, E extends Event>(props: InputProps<NotAnyOrElse<R, unknown>, E>) =>
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
        bg: $(props.color ?? Colors.primary.$5, R.map(withOpacity(31))),
        borderColor: props.color ?? Colors.primary.$5,
        ...props.focused,
      },
    }),
)

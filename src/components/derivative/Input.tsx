import { Platform } from 'react-native'
import { useTheme } from 'src/contexts/Theme'
import type { Color } from 'src/utils/datatypes/Color'
import { TextInput, type TextInputProps } from '../react-native/TextInput'

export type InputProps = TextInputProps & {
  color?: Color
  isEnabled?: boolean
}

export const Input = (props: InputProps) => {
  const { colors } = useTheme()
  return (
    <TextInput
      cursorColor={colors.primary}
      placeholderTextColor={colors.text.gray}
      bg={colors.card}
      fontColor={colors.text.normal}
      fontSize={12}
      py={Platform.OS === 'ios' ? 16.5 : 10}
      px={Platform.OS === 'ios' ? 12 : 14}
      borderWidth={1}
      round={4}
      {...props}
      borderColor={props.borderColor ?? colors.gray.setOpacityFactor(0.375)}
      focused={{
        bg: (props.color ?? colors.primary).setOpacityFactor(0.125),
        borderColor: props.color ?? colors.primary,
        ...props.focused,
      }}
    />
  )
}

import { useState } from 'react'
import { StyleProp, TextInput, TextStyle } from 'react-native'

export const Input = (
  props: Omit<React.ComponentProps<typeof TextInput>, 'style'> & {
    style?:
      | StyleProp<TextStyle>
      | ((state: { isFocused: boolean }) => StyleProp<TextStyle>)
  },
) => {
  const [isFocused, setIsFocused] = useState(false)
  return (
    <TextInput
      {...props}
      onFocus={e => (setIsFocused(true), props.onFocus?.(e))}
      onBlur={e => (setIsFocused(false), props.onBlur?.(e))}
      style={
        typeof props.style === 'function'
          ? props.style({ isFocused })
          : props.style
      }
    />
  )
}

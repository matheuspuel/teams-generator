import React from 'react'
import { TextInput as TextInput_ } from 'src/components/custom'
import { TextInputProps } from 'src/components/custom/react-native/TextInput'

export const TextInput =
  <P extends TextInputProps<any>>(props: P) =>
  (env: P extends TextInputProps<infer R1> ? R1 : never) =>
    React.createElement(TextInput_, { x: props, env })

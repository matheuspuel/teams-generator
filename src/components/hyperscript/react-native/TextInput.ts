import React from 'react'
import { TextInput as TextInput_ } from 'src/components/custom'
import { TextInputProps } from 'src/components/custom/react-native/TextInput'

export const TextInput =
  <R>(props: TextInputProps<R>) =>
  // eslint-disable-next-line react/display-name
  (env: R) =>
    React.createElement(TextInput_<R>, { x: props, env })

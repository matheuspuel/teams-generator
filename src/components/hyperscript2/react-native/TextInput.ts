import { TextInput as TextInput_ } from 'src/components/custom2'
import { TextInputProps } from 'src/components/custom2/react-native/TextInput'

export const TextInput =
  <P extends TextInputProps<any>>(props: P) =>
  (env: P extends TextInputProps<infer R1> ? R1 : never) =>
    TextInput_({ x: props, env })

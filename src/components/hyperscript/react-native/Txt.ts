import { Txt as Txt_ } from 'src/components/custom'
import { TextProps } from 'src/components/custom/react-native/Txt'

export const Txt =
  <R>(props?: TextProps<R>) =>
  (children: string) =>
  (env: R) =>
    Txt_({ x: props, env, children })
import { Txt as Txt_ } from 'src/components/custom2'
import { TextProps } from 'src/components/custom2/react-native/Txt'

export const Txt =
  <R>(props?: TextProps<R>) =>
  (children: string) =>
  (env: R) =>
    Txt_({ x: props, env, children })

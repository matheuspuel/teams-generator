import { Header as Header_ } from 'src/components/custom'
import { HeaderProps } from 'src/components/custom/navigation/Header'

export const Header =
  <R>(props: HeaderProps<R>) =>
  (env: R) =>
    Header_({ x: props, env })

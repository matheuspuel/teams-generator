import { Header as Header_ } from 'src/components/custom2'
import { HeaderProps } from 'src/components/custom2/navigation/Header'

export const Header =
  <R>(props: HeaderProps<R>) =>
  (env: R) =>
    Header_({ x: props, env })

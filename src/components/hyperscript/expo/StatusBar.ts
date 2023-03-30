import {
  StatusBar as StatusBar_,
  StatusBarProps,
} from 'src/components/custom2/expo/StatusBar'

export const StatusBar =
  <R>(props: StatusBarProps<R>) =>
  (env: R) =>
    StatusBar_({ x: props, env })

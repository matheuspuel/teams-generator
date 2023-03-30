import { ActivityIndicator as ActivityIndicator_ } from 'src/components/custom2'
import { ActivityIndicatorProps } from 'src/components/custom2/react-native/ActivityIndicator'

export const ActivityIndicator =
  <R>(props: ActivityIndicatorProps<R>) =>
  (env: R) =>
    ActivityIndicator_({ x: props, env })

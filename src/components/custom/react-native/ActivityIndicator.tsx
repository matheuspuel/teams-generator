import { Reader } from 'fp-ts/lib/Reader'
import { ActivityIndicator as ActivityIndicator_ } from 'react-native'
import { Color } from 'src/utils/datatypes'

export type ActivityIndicatorProps<R> = {
  size?: 'large' | 'small'
  color?: Reader<R, Color>
}

export type ActivityIndicatorArgs<R> = {
  x: ActivityIndicatorProps<R>
  env: R
}

const getRawProps = <R,>({
  x: props,
  env,
}: ActivityIndicatorArgs<R>): React.ComponentProps<
  typeof ActivityIndicator_
> => ({
  size: props?.size ?? 'large',
  color: props?.color ? Color.toHex(props.color(env)) : undefined,
})

export const ActivityIndicator = <R,>(args: ActivityIndicatorArgs<R>) => (
  <ActivityIndicator_ {...getRawProps(args)} />
)

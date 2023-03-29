import Icons_ from '@expo/vector-icons/MaterialIcons'
import { Reader } from 'fp'
import { Color } from 'src/utils/datatypes'

export type IconProps<R extends unknown> = {
  name: React.ComponentProps<typeof Icons_>['name']
  color: Reader<R, Color>
  size: number
  align?: 'left' | 'right' | 'center'
}

export type IconArgs<R> = {
  x: IconProps<R>
  env: R
}

const getRawProps = <R extends unknown>({
  x: props,
  env,
}: IconArgs<R>): React.ComponentProps<typeof Icons_> => ({
  name: props.name,
  size: props.size,
  color: Color.toHex(props.color(env)),
  style: { textAlign: props.align },
})

export const MaterialIcons = <R extends unknown>(args: IconArgs<R>) => (
  <Icons_ {...getRawProps(args)} />
)

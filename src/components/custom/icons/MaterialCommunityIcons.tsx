import Icons_ from '@expo/vector-icons/MaterialCommunityIcons'
import { Reader } from 'fp'
import { Color } from 'src/utils/datatypes'

export type IconProps<R> = {
  name: React.ComponentProps<typeof Icons_>['name']
  color: Reader<R, Color>
  size: number
  align?: 'left' | 'right' | 'center'
}

export type IconArgs<R> = {
  x: IconProps<R>
  env: R
}

const getRawProps = <R,>({
  x: props,
  env,
}: IconArgs<R>): React.ComponentProps<typeof Icons_> => ({
  name: props.name,
  size: props.size,
  color: Color.toHex(props.color(env)),
  style: { textAlign: props.align },
})

export const MaterialCommunityIcons = <R,>(args: IconArgs<R>) => (
  <Icons_ {...getRawProps(args)} />
)

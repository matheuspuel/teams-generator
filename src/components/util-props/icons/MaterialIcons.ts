import { MaterialIcons as MaterialIcons_ } from 'src/components/hyperscript/icons'
import { Color, toHex } from 'src/utils/Color'

type IconProps = {
  name: NonNullable<Parameters<typeof MaterialIcons_>[0]>['name']
  color: Color
  size: number
  align?: 'left' | 'right' | 'center'
}

export const MaterialIcons = (props: IconProps) =>
  MaterialIcons_({
    name: props.name,
    size: props.size,
    color: toHex(props.color),
    style: { textAlign: props.align },
  })

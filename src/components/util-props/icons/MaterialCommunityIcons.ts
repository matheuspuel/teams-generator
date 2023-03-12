import { MaterialCommunityIcons as MaterialCommunityIcons_ } from 'src/components/hyperscript/icons'
import { Color, toHex } from 'src/utils/Color'

type IconProps = {
  name: NonNullable<Parameters<typeof MaterialCommunityIcons_>[0]>['name']
  color: Color
  size: number
  align?: 'left' | 'right' | 'center'
}

export const MaterialCommunityIcons = (props: IconProps) =>
  MaterialCommunityIcons_({
    name: props.name,
    size: props.size,
    color: toHex(props.color),
    style: { textAlign: props.align },
  })

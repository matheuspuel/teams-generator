import MaterialIcons_ from '@expo/vector-icons/MaterialIcons'
import { Color, toHex } from 'src/utils/Color'

type IconProps = {
  name: React.ComponentProps<typeof MaterialIcons_>['name']
  color: Color
  size: number
  align?: 'left' | 'right' | 'center'
}

export const MaterialIcons = (props: IconProps) => (
  <MaterialIcons_
    {...{
      name: props.name,
      size: props.size,
      color: toHex(props.color),
      style: { textAlign: props.align },
    }}
  />
)

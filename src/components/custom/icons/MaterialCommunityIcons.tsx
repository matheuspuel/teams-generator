import MaterialCommunityIcons_ from '@expo/vector-icons/MaterialCommunityIcons'
import { Color, toHex } from 'src/utils/datatypes/Color'

type IconProps = {
  name: React.ComponentProps<typeof MaterialCommunityIcons_>['name']
  color: Color
  size: number
  align?: 'left' | 'right' | 'center'
}

export const MaterialCommunityIcons = (props: IconProps) => (
  <MaterialCommunityIcons_
    {...{
      name: props.name,
      size: props.size,
      color: toHex(props.color),
      style: { textAlign: props.align },
    }}
  />
)

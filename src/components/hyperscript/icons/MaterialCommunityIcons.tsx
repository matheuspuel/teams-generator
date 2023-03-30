import { MaterialCommunityIcons as MaterialCommunityIcons_ } from 'src/components/custom'
import { IconProps } from 'src/components/custom/icons/MaterialCommunityIcons'

export const MaterialCommunityIcons =
  <R,>(props: IconProps<R>) =>
  (env: R) =>
    MaterialCommunityIcons_({ x: props, env })

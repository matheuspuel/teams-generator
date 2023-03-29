import { MaterialCommunityIcons as MaterialCommunityIcons_ } from 'src/components/custom2'
import { IconProps } from 'src/components/custom2/icons/MaterialCommunityIcons'

export const MaterialCommunityIcons =
  <R,>(props: IconProps<R>) =>
  (env: R) =>
    MaterialCommunityIcons_({ x: props, env })

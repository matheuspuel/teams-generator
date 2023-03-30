import { MaterialIcons as MaterialIcons_ } from 'src/components/custom2'
import { IconProps } from 'src/components/custom2/icons/MaterialIcons'

export const MaterialIcons =
  <R,>(props: IconProps<R>) =>
  (env: R) =>
    MaterialIcons_({ x: props, env })

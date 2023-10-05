import { named2 } from '../hyperscript'
import { GhostButton } from './GhostButton'

export const BorderlessButton: typeof GhostButton = named2('BorderlessButton')(
  props =>
    GhostButton({
      ...props,
      borderless: true,
    }),
)

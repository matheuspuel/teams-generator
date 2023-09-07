import { named3 } from '../helpers'
import { GhostButton } from './GhostButton'

export const BorderlessButton: typeof GhostButton = named3('BorderlessButton')(
  props =>
    GhostButton({
      ...props,
      borderless: true,
    }),
)

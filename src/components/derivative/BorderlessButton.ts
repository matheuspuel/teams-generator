import { GhostButton } from './GhostButton'

export const BorderlessButton: typeof GhostButton = props =>
  GhostButton({
    ...props,
    borderless: true,
  })

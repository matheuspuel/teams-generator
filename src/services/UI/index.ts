import { Effect } from 'effect'

export type UIImplementation = {
  start: () => Effect.Effect<void>
}

export class UI extends Effect.Tag('UI')<UI, UIImplementation>() {}

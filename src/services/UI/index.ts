import { Context, Effect } from 'effect'

export type UI = {
  start: () => Effect.Effect<void>
}

export class UIEnv extends Context.Tag('UI')<UIEnv, UI>() {}

export const UI = Effect.serviceFunctions(UIEnv)

import * as Context from 'effect/Context'
import { Effect } from 'effect/Effect'
import { F } from 'src/utils/fp'

export type UI = {
  start: () => Effect<void>
}

export class UIEnv extends Context.Tag('UI')<UIEnv, UI>() {}

export const UI = F.serviceFunctions(UIEnv)

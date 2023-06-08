import * as Context from '@effect/data/Context'
import { Effect } from '@effect/io/Effect'
import { Eff } from 'src/utils/fp'

export type UI = {
  start: Effect<never, never, void>
}

export type UIEnv = { ui: UI }

export const UIEnv = Context.Tag<UIEnv>()

export const UI = {
  start: Eff.flatMap(UIEnv, env => env.ui.start),
}

import * as Context from '@effect/data/Context'
import { Effect } from '@effect/io/Effect'
import { F } from 'src/utils/fp'

export type UI = {
  start: () => Effect<never, never, void>
}

export const UIEnv = Context.Tag<UI>()

export const UI = F.serviceFunctions(UIEnv)

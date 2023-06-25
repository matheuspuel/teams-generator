import * as Context from '@effect/data/Context'
import { Effect } from '@effect/io/Effect'
import { AppEventHandlerEnv } from 'src/events/handler'
import { Eff } from 'src/utils/fp'
import { SafeAreaServiceEnv } from '../SafeArea'
import { AppStateRefEnv } from '../StateRef'
import { AppThemeEnv } from '../Theme'

export type UI = {
  start: Effect<never, never, void>
}

export type UIServiceEnv = { ui: UI }

export const UIServiceEnv = Context.Tag<UIServiceEnv>()

export const UI = {
  start: Eff.flatMap(UIServiceEnv, env => env.ui.start),
}

export type UIEnv = AppThemeEnv &
  AppEventHandlerEnv &
  SafeAreaServiceEnv &
  AppStateRefEnv

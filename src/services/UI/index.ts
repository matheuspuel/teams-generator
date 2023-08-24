import * as Context from '@effect/data/Context'
import { Effect } from '@effect/io/Effect'
import { AppEventHandler } from 'src/services/EventHandler'
import { F } from 'src/utils/fp'
import { SafeAreaService } from '../SafeArea'
import { AppStateRef } from '../StateRef'
import { AppTheme } from '../Theme'

export type UI = {
  start: Effect<never, never, void>
}

export const UIEnv = Context.Tag<UI>()

export const UI = {
  start: F.flatMap(UIEnv, env => env.start),
}

export type UIEnv = {
  Theme: AppTheme
  SafeArea: SafeAreaService
  EventHandler: AppEventHandler
  StateRef: AppStateRef
}

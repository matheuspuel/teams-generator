import * as Context from '@effect/data/Context'
import { Effect } from '@effect/io/Effect'
import { AppEventHandler } from 'src/services/EventHandler'
import { F, Runtime } from 'src/utils/fp'
import { SafeAreaService } from '../SafeArea'
import { AppStateRef } from '../StateRef'
import { AppTheme } from '../Theme'
import { UIContext } from './context'

export type UI = {
  start: () => Effect<never, never, void>
}

export const UIEnv = Context.Tag<UI>()

export const UI = F.serviceFunctions(UIEnv)

export type UIEnv = {
  Theme: AppTheme
  SafeArea: SafeAreaService
  StateRef: AppStateRef
  context: UIContext
  runtime: Runtime.Runtime<AppEventHandler>
}

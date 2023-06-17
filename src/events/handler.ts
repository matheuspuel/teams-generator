import { $, Context, Eff, Effect } from 'fp'
import { AppEvent, appEventsDefinition } from '.'
import { EventHandlerEnv, makeEventHandler } from './helpers'

const appEventHandler_ = makeEventHandler(appEventsDefinition)

export const appEventHandler = (event: AppEvent) =>
  $(
    appEventHandler_(event),
    Eff.catchAll(() => Eff.unit()),
  )

export type AppEventHandlerEnv = EventHandlerEnv<AppEvent>

export const AppEventHandlerEnv = Context.Tag<AppEventHandlerEnv>()

export const EventHandler = {
  handle: (event: AppEvent): Effect<AppEventHandlerEnv, never, void> =>
    Eff.flatMap(AppEventHandlerEnv, env => env.eventHandler(event)),
}

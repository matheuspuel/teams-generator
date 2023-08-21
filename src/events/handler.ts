import { $, Context, F, Effect } from 'fp'
import { AppEvent, appEventsDefinition } from '.'
import { EventHandlerEnv, makeEventHandler } from './helpers'

const appEventHandler_ = makeEventHandler(appEventsDefinition)

export const appEventHandler = (event: AppEvent) =>
  $(
    appEventHandler_(event),
    F.catchAll(() => F.unit),
  )

export type AppEventHandlerEnv = EventHandlerEnv<AppEvent>

export const AppEventHandlerEnv = Context.Tag<AppEventHandlerEnv>()

export const EventHandler = {
  handle: (event: AppEvent): Effect<AppEventHandlerEnv, never, void> =>
    F.flatMap(AppEventHandlerEnv, env => env.eventHandler(event)),
}

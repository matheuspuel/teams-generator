import { Context, Effect, F } from 'fp'
import { AppEvent } from 'src/events'
import { EventHandler } from 'src/events/helpers'

export type AppEventHandler = EventHandler<AppEvent>

export const AppEventHandlerEnv = Context.Tag<AppEventHandler>()

export const AppEventHandler = {
  handle: (event: AppEvent): Effect<AppEventHandler, never, void> =>
    F.flatMap(AppEventHandlerEnv, env => env(event)),
}

import { Context, F } from 'fp'
import { AppEvent } from 'src/events'
import { EventHandler } from 'src/events/helpers'

export type AppEventHandler = { handle: EventHandler<AppEvent> }

export const AppEventHandlerEnv = Context.Tag<AppEventHandler>()

export const AppEventHandler = F.serviceFunctions(AppEventHandlerEnv)

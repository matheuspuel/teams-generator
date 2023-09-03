import { $, F, Layer } from 'fp'
import {
  AppEvent,
  AppEventHandlerRequirements,
  appEventsDefinition,
} from 'src/events'
import { makeEventHandler } from 'src/events/helpers'
import { AppEventHandlerEnv } from '.'

const appEventHandler_ = makeEventHandler(appEventsDefinition)

export const AppEventHandlerLive = F.map(
  F.context<AppEventHandlerRequirements>(),
  ctx =>
    AppEventHandlerEnv.context({
      handle: (event: AppEvent) =>
        $(
          appEventHandler_(event),
          F.catchAll(() => F.unit),
          F.provideContext(ctx),
        ),
    }),
).pipe(Layer.effectContext)

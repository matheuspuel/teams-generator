import * as Context from 'effect/Context'
import { Effect, F } from 'src/utils/fp'

export type Alert = {
  alert: (args: {
    type: 'error' | 'success'
    title: string
    message: string
  }) => Effect<never, never, void>
  dismiss: () => Effect<never, never, void>
}

export const AlertEnv = Context.Tag<Alert>()

export const Alert = F.serviceFunctions(AlertEnv)

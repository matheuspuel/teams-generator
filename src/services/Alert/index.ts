import { Effect } from 'effect'
import * as Context from 'effect/Context'

export type Alert = {
  alert: (args: {
    type: 'error' | 'success'
    title: string
    message: string
  }) => Effect.Effect<void>
  dismiss: () => Effect.Effect<void>
}

export class AlertEnv extends Context.Tag('Alert')<AlertEnv, Alert>() {}

export const Alert = Effect.serviceFunctions(AlertEnv)

import * as Context from 'effect/Context'
import { Effect, F } from 'src/utils/fp'

export type Alert = {
  alert: (args: {
    type: 'error' | 'success'
    title: string
    message: string
  }) => Effect<void>
  dismiss: () => Effect<void>
}

export class AlertEnv extends Context.Tag('Alert')<AlertEnv, Alert>() {}

export const Alert = F.serviceFunctions(AlertEnv)

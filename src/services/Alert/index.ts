import { Effect } from 'effect'

export type AlertImplementation = {
  alert: (args: {
    type: 'error' | 'success'
    title: string
    message: string
  }) => Effect.Effect<void>
  dismiss: () => Effect.Effect<void>
}

export class Alert extends Effect.Tag('Alert')<Alert, AlertImplementation>() {}

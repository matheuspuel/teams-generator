import { Duration, Effect, Stream, SubscriptionRef, pipe } from 'effect'
import { alertActions } from 'src/state/alert'

const ref = SubscriptionRef.make<void>(undefined).pipe(Effect.runSync)

const stream = pipe(
  ref.changes,
  Stream.debounce(Duration.decode('5 seconds')),
  Stream.tap(() => Effect.sync(() => alertActions.set(null))),
)

export class Alert extends Effect.Service<Alert>()('Alert', {
  accessors: true,
  effect: pipe(
    stream,
    Stream.runDrain,
    Effect.forkDaemon,
    Effect.map(() => ({
      alert: (args: {
        type: 'error' | 'success'
        title: string
        message: string
      }) =>
        pipe(
          Effect.sync(() => alertActions.set(args)),
          Effect.tap(() => SubscriptionRef.set(ref, undefined)),
        ),
      dismiss: () => Effect.sync(() => alertActions.set(null)),
    })),
  ),
}) {}

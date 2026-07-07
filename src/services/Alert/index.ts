import { Duration, Effect, Stream, SubscriptionRef, pipe } from 'effect'
import { root } from 'src/model/optic'
import { AppStateRef, State, StateRef } from 'src/services/StateRef'

const ref = SubscriptionRef.make<void>(undefined).pipe(Effect.runSync)

const stream = pipe(
  ref.changes,
  Stream.debounce(Duration.decode('5 seconds')),
  Stream.tap(() => StateRef.execute(State.on(root.at('alert')).set(null))),
)

export class Alert extends Effect.Service<Alert>()('Alert', {
  accessors: true,
  effect: pipe(
    stream,
    Stream.runDrain,
    Effect.forkDaemon,
    Effect.flatMap(() => Effect.context<AppStateRef>()),
    Effect.map(ctx => ({
      alert: (args: {
        type: 'error' | 'success'
        title: string
        message: string
      }) =>
        pipe(
          State.on(root.at('alert')).set(args),
          StateRef.execute,
          Effect.tap(() => SubscriptionRef.set(ref, undefined)),
          Effect.provide(ctx),
        ),
      dismiss: () =>
        pipe(
          State.on(root.at('alert')).set(null),
          StateRef.execute,
          Effect.provide(ctx),
        ),
    })),
  ),
}) {}

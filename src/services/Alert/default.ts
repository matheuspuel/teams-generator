import {
  Duration,
  Effect,
  Layer,
  Option,
  Stream,
  SubscriptionRef,
  pipe,
} from 'effect'
import { root } from 'src/model/optic'
import { AppStateRefEnv, State, StateRef } from 'src/services/StateRef'
import { AlertEnv } from '.'

const ref = SubscriptionRef.make<void>(undefined).pipe(Effect.runSync)

const stream = pipe(
  ref.changes,
  Stream.debounce(Duration.decode('5 seconds')),
  Stream.tap(() =>
    StateRef.execute(State.on(root.at('alert')).set(Option.none())),
  ),
)

export const AlertLive = pipe(
  stream,
  Stream.runDrain,
  Effect.forkDaemon,
  Effect.flatMap(() => Effect.context<AppStateRefEnv>()),
  Effect.map(ctx =>
    AlertEnv.context({
      alert: (args: {
        type: 'error' | 'success'
        title: string
        message: string
      }) =>
        pipe(
          State.on(root.at('alert')).set(Option.some(args)),
          StateRef.execute,
          Effect.tap(() => SubscriptionRef.set(ref, undefined)),
          Effect.provide(ctx),
        ),
      dismiss: () =>
        pipe(
          State.on(root.at('alert')).set(Option.none()),
          StateRef.execute,
          Effect.provide(ctx),
        ),
    }),
  ),
).pipe(Layer.effectContext)

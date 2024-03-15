import { Duration, F, Layer, O, Stream, SubscriptionRef, pipe } from 'fp'
import { root } from 'src/model/optic'
import { AppStateRefEnv, State, StateRef } from 'src/services/StateRef'
import { AlertEnv } from '.'

const ref = SubscriptionRef.make<void>(undefined).pipe(F.runSync)

const stream = pipe(
  ref.changes,
  Stream.debounce(Duration.decode('5 seconds')),
  Stream.tap(() => StateRef.execute(State.on(root.at('alert')).set(O.none()))),
)

export const AlertLive = pipe(
  stream,
  Stream.runDrain,
  F.forkDaemon,
  F.flatMap(() => F.context<AppStateRefEnv>()),
  F.map(ctx =>
    AlertEnv.context({
      alert: (args: {
        type: 'error' | 'success'
        title: string
        message: string
      }) =>
        pipe(
          State.on(root.at('alert')).set(O.some(args)),
          StateRef.execute,
          F.tap(() => SubscriptionRef.set(ref, undefined)),
          F.provide(ctx),
        ),
      dismiss: () =>
        pipe(
          State.on(root.at('alert')).set(O.none()),
          StateRef.execute,
          F.provide(ctx),
        ),
    }),
  ),
).pipe(Layer.effectContext)

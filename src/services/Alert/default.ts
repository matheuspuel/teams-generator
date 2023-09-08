import { Duration, F, Layer, O, Stream, SubscriptionRef, pipe } from 'fp'
import { root } from 'src/model/optic'
import { AlertEnv } from '.'
import { AppStateRef, StateRef } from '../StateRef'

const ref = SubscriptionRef.make<void>(undefined).pipe(F.runSync)

const stream = pipe(
  ref.changes,
  Stream.debounce(Duration.decode('5 seconds')),
  Stream.tap(() => StateRef.on(root.at('alert')).set(O.none())),
)

export const AlertLive = pipe(
  stream,
  Stream.runDrain,
  F.forkDaemon,
  F.flatMap(() => F.context<AppStateRef>()),
  F.map(ctx =>
    AlertEnv.context({
      alert: (args: {
        type: 'error' | 'success'
        title: string
        message: string
      }) =>
        pipe(
          StateRef.on(root.at('alert')).set(O.some(args)),
          F.tap(() => SubscriptionRef.set(ref, undefined)),
          F.provideContext(ctx),
        ),
      dismiss: () =>
        pipe(
          StateRef.on(root.at('alert')).set(O.none()),
          F.provideContext(ctx),
        ),
    }),
  ),
).pipe(Layer.effectContext)

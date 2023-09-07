import { Duration, F, Layer, O, Stream, SubscriptionRef, pipe } from 'fp'
import { root } from 'src/model/optic'
import { AlertEnv } from '.'
import { AppStateRef, execute, replaceSApp } from '../StateRef'

const ref = SubscriptionRef.make<void>(undefined).pipe(F.runSync)

const stream = pipe(
  ref.changes,
  Stream.debounce(Duration.decode('5 seconds')),
  Stream.tap(() => execute(replaceSApp(root.at('alert'))(O.none()))),
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
          execute(replaceSApp(root.at('alert'))(O.some(args))),
          F.tap(() => SubscriptionRef.set(ref, undefined)),
          F.provideContext(ctx),
        ),
      dismiss: () =>
        pipe(
          execute(replaceSApp(root.at('alert'))(O.none())),
          F.provideContext(ctx),
        ),
    }),
  ),
).pipe(Layer.effectContext)

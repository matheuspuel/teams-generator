import * as Context from '@effect/data/Context'
import {
  Effect,
  F,
  O,
  Optic,
  Option,
  Stream,
  SubscriptionRef,
  SynchronizedRef,
  flow,
  pipe,
} from 'fp'
import { RootState } from 'src/model'

export type AppStateRef = SubscriptionRef.SubscriptionRef<RootState>

export const AppStateRefEnv = Context.Tag<AppStateRef>()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyStateTag = Context.Tag<SynchronizedRef.SynchronizedRef<any>>()
const stateTag = <A = never>(): Context.Tag<
  SynchronizedRef.SynchronizedRef<A>,
  SynchronizedRef.SynchronizedRef<A>
> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  anyStateTag

const preparedStateOperations = <A>() => ({
  get: F.flatMap(stateTag<A>(), SynchronizedRef.get),
  set: (a: A) => F.flatMap(stateTag<A>(), SynchronizedRef.set(a)),
  update: (f: (a: A) => A) =>
    F.flatMap(stateTag<A>(), SynchronizedRef.update(f)),
  modify: <B>(f: (a: A) => readonly [B, A]) =>
    F.flatMap(stateTag<A>(), SynchronizedRef.modify(f)),
  modifyEffect: <R, E, B>(f: (a: A) => Effect<R, E, readonly [B, A]>) =>
    F.flatMap(stateTag<A>(), SynchronizedRef.modifyEffect(f)),
})

const State_ = preparedStateOperations<RootState>()

export const State = {
  ...State_,
  on: <B>(optic: Optic.PolyReversedPrism<RootState, RootState, B, B>) => ({
    get: State_.get.pipe(F.map(r => Optic.get(optic)(r))),
    set: (b: B) => State_.update(Optic.replace(optic)(b)),
    update: (f: (b: B) => B) => State_.update(Optic.modify(optic)(f)),
    modify: <C>(f: (b: B) => readonly [C, B]) =>
      State_.modify<C>(r =>
        pipe(
          Optic.get(optic)(r),
          f,
          v => [v[0], Optic.replace(optic)(v[1])(r)] as const,
        ),
      ),
  }),
  onOption: <B>(optic: Optic.PolyOptional<RootState, RootState, B, B>) => ({
    get: State_.get.pipe(F.map(r => O.fromFpTs(Optic.getOption(optic)(r)))),
    set: (b: B) => State_.update(Optic.replace(optic)(b)),
    update: (f: (b: B) => B) => State_.update(Optic.modify(optic)(f)),
    modify: <C>(f: (b: B) => readonly [C, B]) =>
      State_.modify<Option<C>>(r =>
        pipe(
          O.fromFpTs(Optic.getOption(optic)(r)),
          O.map(
            flow(
              f,
              v => [O.some(v[0]), Optic.replace(optic)(v[1])(r)] as const,
            ),
          ),
          O.getOrElse(() => [O.none<C>(), r] as const),
        ),
      ),
  }),
}

type Subscription = (state: RootState) => Effect<never, never, void>

const subscriptions: Array<Subscription> = []

const tag = AppStateRefEnv

export const StateRef = {
  react: {
    subscribe: (f: Subscription) =>
      F.sync(() => {
        // eslint-disable-next-line functional/immutable-data, functional/no-expression-statements
        subscriptions.push(f)
      }),
  },
  changes: Stream.flatMap(tag, env => env.changes),
  get: F.flatMap(tag, SubscriptionRef.get),
  execute: <R, E, B>(
    effect: Effect<R | SynchronizedRef.SynchronizedRef<RootState>, E, B>,
  ) =>
    pipe(
      tag,
      F.flatMap(
        SubscriptionRef.modifyEffect(s =>
          SynchronizedRef.make(s).pipe(
            F.flatMap(ref =>
              pipe(
                F.all([effect, SynchronizedRef.get(ref)]),
                F.provideService(stateTag<RootState>(), ref),
              ),
            ),
          ),
        ),
      ),
      F.tap(() =>
        pipe(
          tag,
          F.flatMap(SubscriptionRef.get),
          F.flatMap(s => F.sync(() => subscriptions.map(f => f(s)))),
          F.flatMap(F.all),
        ),
      ),
    ),
  query: <R, E, B>(
    effect: Effect<R | SynchronizedRef.SynchronizedRef<RootState>, E, B>,
  ) =>
    pipe(
      tag,
      F.flatMap(SubscriptionRef.get),
      F.flatMap(s =>
        SynchronizedRef.make(s).pipe(
          F.flatMap(ref =>
            pipe(effect, F.provideService(stateTag<RootState>(), ref)),
          ),
        ),
      ),
    ),
}

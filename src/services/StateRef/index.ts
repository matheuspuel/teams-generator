import * as Context from 'effect/Context'
import {
  Chunk,
  Effect,
  Exit,
  F,
  O,
  Optic,
  Option,
  Ref,
  Runtime,
  Stream,
  flow,
  pipe,
} from 'fp'
import { RootState } from 'src/model'

export type AppStateRef = Ref.Ref<RootState> & { _StateRef: true }

export const AppStateRefEnv = Context.Tag<AppStateRef>()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyStateTag = Context.Tag<Ref.Ref<any>>()
const stateTag = <A = never>(): Context.Tag<Ref.Ref<A>, Ref.Ref<A>> =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  anyStateTag

const preparedStateOperations = <A>() => ({
  get: F.flatMap(stateTag<A>(), Ref.get),
  set: (a: A) => F.flatMap(stateTag<A>(), Ref.set(a)),
  update: (f: (a: A) => A) => F.flatMap(stateTag<A>(), Ref.update(f)),
  modify: <B>(f: (a: A) => readonly [B, A]) =>
    F.flatMap(stateTag<A>(), Ref.modify(f)),
  // modifyEffect: <R, E, B>(f: (a: A) => Effect<R, E, readonly [B, A]>) =>
  //   F.flatMap(stateTag<A>(), Ref.modifyEffect(f)),
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

// eslint-disable-next-line functional/no-let
let subscriptions: Array<Subscription> = []

const tag = AppStateRefEnv

const subscribe = (f: Subscription) =>
  pipe(
    F.sync(() => {
      // eslint-disable-next-line functional/immutable-data, functional/no-expression-statements
      subscriptions.push(f)
    }),
    F.map(() => ({
      unsubscribe: () =>
        F.sync(() => {
          // eslint-disable-next-line functional/no-expression-statements
          subscriptions = subscriptions.filter(s => s !== f)
        }),
    })),
  )

export const StateRef = {
  react: { subscribe: subscribe },
  changes: Stream.asyncEffect<never, never, RootState>(emit =>
    subscribe(s => F.sync(() => emit(F.succeed(Chunk.of(s))))),
  ),
  get: F.flatMap(tag, Ref.get),
  execute: <R, E, B>(
    effect: Effect<R | Ref.Ref<RootState>, E, B>,
  ): Effect<Exclude<R, Ref.Ref<RootState>> | AppStateRef, E, B> =>
    pipe(
      F.all({ stateRef: tag, runtime: F.runtime<R | Ref.Ref<RootState>>() }),
      F.flatMap(({ runtime, stateRef }) =>
        Ref.modify(stateRef, s =>
          pipe(
            Ref.make(s),
            F.flatMap(ref =>
              pipe(
                F.all([effect, Ref.get(ref)]),
                F.provideService(stateTag<RootState>(), ref),
              ),
            ),
            F.exit,
            Runtime.runSync(runtime),
            Exit.match({
              onFailure: (
                e,
              ): readonly [Exit.Exit<E, readonly [B, RootState]>, RootState] =>
                [Exit.failCause(e), s] as const,
              onSuccess: v => [Exit.succeed(v), v[1]] as const,
            }),
          ),
        ),
      ),
      F.flatten,
      F.tap(([, s]) => F.all(subscriptions.map(f => f(s)))),
      F.map(([_]) => _),
      f =>
        f as Effect<
          Exclude<Effect.Context<typeof f>, Ref.Ref<RootState>> | AppStateRef,
          Effect.Error<typeof f>,
          Effect.Success<typeof f>
        >,
    ),
  query: <R, E, B>(effect: Effect<R | Ref.Ref<RootState>, E, B>) =>
    pipe(
      tag,
      F.flatMap(Ref.get),
      F.flatMap(s =>
        Ref.make(s).pipe(
          F.flatMap(ref =>
            pipe(effect, F.provideService(stateTag<RootState>(), ref)),
          ),
        ),
      ),
    ),
}

import * as Context from 'effect/Context'
import {
  A,
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
import { unstable_batchedUpdates } from 'react-native'
import { RootState } from 'src/model'

export type AppStateRef = {
  ref: Ref.Ref<RootState>
  subscriptionsRef: Ref.Ref<ReadonlyArray<Subscription>>
}

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
  with: <B>(
    selector: (rootState: RootState) => B,
  ): Effect<Ref.Ref<RootState>, never, B> => State_.get.pipe(F.map(selector)),
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
    get: State_.get.pipe(F.map(r => Optic.getOption(optic)(r))),
    set: (b: B) => State_.update(Optic.replace(optic)(b)),
    update: (f: (b: B) => B) => State_.update(Optic.modify(optic)(f)),
    modify: <C>(f: (b: B) => readonly [C, B]) =>
      State_.modify<Option<C>>(r =>
        pipe(
          Optic.getOption(optic)(r),
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

export type Subscription = (state: RootState) => Effect<never, never, void>

const subscriptionsRef = Ref.unsafeMake<Array<Subscription>>([])

const tag = AppStateRefEnv

const subscribe = (f: Subscription) =>
  pipe(
    Ref.update(subscriptionsRef, A.append(f)),
    F.map(() => ({
      unsubscribe: () =>
        Ref.update(subscriptionsRef, ss =>
          pipe(
            A.findFirstIndex(ss, s => s === f),
            O.map(i => A.remove(ss, i)),
            O.getOrElse(() => ss),
          ),
        ),
    })),
  )

export const StateRef = {
  react: { subscribe: subscribe },
  changes: Stream.asyncEffect<never, never, RootState>(emit =>
    subscribe(s => F.sync(() => emit(F.succeed(Chunk.of(s))))),
  ),
  get: F.flatMap(tag, _ => Ref.get(_.ref)),
  execute: <R, E, B>(
    effect: Effect<R | Ref.Ref<RootState>, E, B>,
  ): Effect<Exclude<R, Ref.Ref<RootState>> | AppStateRef, E, B> =>
    pipe(
      F.all({ stateRef: tag, runtime: F.runtime<R>() }),
      F.bind('result', ({ runtime, stateRef }) =>
        Ref.modify(stateRef.ref, s =>
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
      f =>
        f as Effect<
          Exclude<Effect.Context<typeof f>, Ref.Ref<RootState>>,
          Effect.Error<typeof f>,
          Effect.Success<typeof f>
        >,
      F.flatMap(({ result, stateRef }) =>
        pipe(
          result,
          F.tap(([, s]) =>
            pipe(
              Ref.get(stateRef.subscriptionsRef),
              F.tap(ss =>
                F.sync(() =>
                  unstable_batchedUpdates(() => {
                    // eslint-disable-next-line functional/no-expression-statements
                    F.all(ss.map(f => f(s))).pipe(F.runSync)
                  }),
                ),
              ),
            ),
          ),
          F.map(([_]) => _),
        ),
      ),
    ),
  query: <R, E, B>(effect: Effect<R | Ref.Ref<RootState>, E, B>) =>
    pipe(
      tag,
      F.flatMap(_ => Ref.get(_.ref)),
      F.flatMap(s =>
        Ref.make(s).pipe(
          F.flatMap(ref =>
            pipe(effect, F.provideService(stateTag<RootState>(), ref)),
          ),
        ),
      ),
    ),
}

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

export class AppStateRefEnv extends Context.Tag('AppStateRef')<
  AppStateRefEnv,
  AppStateRef
>() {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class InternalStateRef<_A> extends Context.Tag('InternalStateRef')<
  InternalStateRef<never>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Ref.Ref<any>
>() {}
const stateTag = <A = never>(): Context.TagClass<
  InternalStateRef<A>,
  'InternalStateRef',
  Ref.Ref<A>
> => InternalStateRef<A>

const preparedStateOperations = <A>() => ({
  with: <B>(
    selector: (rootState: A) => B,
  ): Effect<B, never, InternalStateRef<A>> =>
    F.flatMap(stateTag<A>(), Ref.get).pipe(F.map(selector)),
  flatWith: <R, E, B>(
    effect: (rootState: A) => Effect<B, E, R>,
  ): Effect<B, E, InternalStateRef<A> | R> =>
    F.flatMap(stateTag<A>(), Ref.get).pipe(F.flatMap(effect)),
  get: F.flatMap(stateTag<A>(), Ref.get),
  set: (a: A) => F.flatMap(stateTag<A>(), Ref.set(a)),
  update: (f: (a: A) => A) => F.flatMap(stateTag<A>(), Ref.update(f)),
  modify: <B>(f: (a: A) => readonly [B, A]) =>
    F.flatMap(stateTag<A>(), Ref.modify(f)),
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

export type Subscription = (state: RootState) => Effect<void>

const tag = AppStateRefEnv

const subscribe = (f: Subscription) =>
  tag.pipe(
    F.flatMap(stateRef =>
      pipe(
        Ref.update(stateRef.subscriptionsRef, A.append(f)),
        F.map(() => ({
          unsubscribe: () =>
            Ref.update(stateRef.subscriptionsRef, ss =>
              pipe(
                A.findFirstIndex(ss, s => s === f),
                O.map(i => A.remove(ss, i)),
                O.getOrElse(() => ss),
              ),
            ),
        })),
      ),
    ),
  )

export const StateRef = {
  react: { subscribe: subscribe },
  changes: Stream.asyncEffect<RootState, never, AppStateRefEnv>(emit =>
    subscribe(s => F.sync(() => emit(F.succeed(Chunk.of(s))))),
  ),
  get: F.flatMap(tag, _ => Ref.get(_.ref)),
  execute: <R, E, B>(
    effect: Effect<B, E, R | InternalStateRef<RootState>>,
  ): Effect<B, E, Exclude<R, InternalStateRef<RootState>> | AppStateRefEnv> =>
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
              ): readonly [Exit.Exit<readonly [B, RootState], E>, RootState] =>
                [Exit.failCause(e), s] as const,
              onSuccess: v => [Exit.succeed(v), v[1]] as const,
            }),
          ),
        ),
      ),
      f =>
        f as Effect<
          Effect.Success<typeof f>,
          Effect.Error<typeof f>,
          Exclude<Effect.Context<typeof f>, InternalStateRef<RootState>>
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
  query: <B, E, R>(effect: Effect<B, E, R | InternalStateRef<RootState>>) =>
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

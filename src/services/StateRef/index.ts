import * as Optic from '@fp-ts/optic'
import {
  Chunk,
  Context,
  Effect,
  Exit,
  Option,
  ReadonlyArray,
  Ref,
  Runtime,
  Stream,
  flow,
  pipe,
} from 'effect'
import { unstable_batchedUpdates } from 'react-native'
import { RootState } from 'src/model'

export type AppStateRefImplementation = {
  ref: Ref.Ref<RootState>
  subscriptionsRef: Ref.Ref<ReadonlyArray<Subscription>>
}

export class AppStateRef extends Effect.Tag('AppStateRef')<
  AppStateRef,
  AppStateRefImplementation
>() {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class InternalStateRef<_A> extends Effect.Tag('InternalStateRef')<
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
  ): Effect.Effect<B, never, InternalStateRef<A>> =>
    Effect.flatMap(stateTag<A>(), Ref.get).pipe(Effect.map(selector)),
  flatWith: <R, E, B>(
    effect: (rootState: A) => Effect.Effect<B, E, R>,
  ): Effect.Effect<B, E, InternalStateRef<A> | R> =>
    Effect.flatMap(stateTag<A>(), Ref.get).pipe(Effect.flatMap(effect)),
  get: Effect.flatMap(stateTag<A>(), Ref.get),
  set: (a: A) => Effect.flatMap(stateTag<A>(), Ref.set(a)),
  update: (f: (a: A) => A) => Effect.flatMap(stateTag<A>(), Ref.update(f)),
  modify: <B>(f: (a: A) => readonly [B, A]) =>
    Effect.flatMap(stateTag<A>(), Ref.modify(f)),
})

const State_ = preparedStateOperations<RootState>()

export const State = {
  ...State_,
  on: <B>(optic: Optic.PolyReversedPrism<RootState, RootState, B, B>) => ({
    get: State_.get.pipe(Effect.map(r => Optic.get(optic)(r))),
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
    get: State_.get.pipe(Effect.map(r => Optic.getOption(optic)(r))),
    set: (b: B) => State_.update(Optic.replace(optic)(b)),
    update: (f: (b: B) => B) => State_.update(Optic.modify(optic)(f)),
    modify: <C>(f: (b: B) => readonly [C, B]) =>
      State_.modify<Option.Option<C>>(r =>
        pipe(
          Optic.getOption(optic)(r),
          Option.map(
            flow(
              f,
              v => [Option.some(v[0]), Optic.replace(optic)(v[1])(r)] as const,
            ),
          ),
          Option.getOrElse(() => [Option.none<C>(), r] as const),
        ),
      ),
  }),
}

export type Subscription = (state: RootState) => Effect.Effect<void>

const tag = AppStateRef

const subscribe = (f: Subscription) =>
  tag.pipe(
    Effect.flatMap(stateRef =>
      pipe(
        Ref.update(stateRef.subscriptionsRef, ReadonlyArray.append(f)),
        Effect.map(() => ({
          unsubscribe: () =>
            Ref.update(stateRef.subscriptionsRef, ss =>
              pipe(
                ReadonlyArray.findFirstIndex(ss, s => s === f),
                Option.map(i => ReadonlyArray.remove(ss, i)),
                Option.getOrElse(() => ss),
              ),
            ),
        })),
      ),
    ),
  )

export const StateRef = {
  react: { subscribe: subscribe },
  changes: Stream.asyncEffect<RootState, never, AppStateRef>(emit =>
    subscribe(s => Effect.sync(() => emit(Effect.succeed(Chunk.of(s))))),
  ),
  get: Effect.flatMap(tag, _ => Ref.get(_.ref)),
  execute: <R, E, B>(
    effect: Effect.Effect<B, E, R | InternalStateRef<RootState>>,
  ): Effect.Effect<
    B,
    E,
    Exclude<R, InternalStateRef<RootState>> | AppStateRef
  > =>
    pipe(
      Effect.all({ stateRef: tag, runtime: Effect.runtime<R>() }),
      Effect.bind('result', ({ runtime, stateRef }) =>
        Ref.modify(stateRef.ref, s =>
          pipe(
            Ref.make(s),
            Effect.flatMap(ref =>
              pipe(
                Effect.all([effect, Ref.get(ref)]),
                Effect.provideService(stateTag<RootState>(), ref),
              ),
            ),
            Effect.exit,
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
        f as Effect.Effect<
          Effect.Effect.Success<typeof f>,
          Effect.Effect.Error<typeof f>,
          Exclude<Effect.Effect.Context<typeof f>, InternalStateRef<RootState>>
        >,
      Effect.flatMap(({ result, stateRef }) =>
        pipe(
          result,
          Effect.tap(([, s]) =>
            pipe(
              Ref.get(stateRef.subscriptionsRef),
              Effect.tap(ss =>
                Effect.sync(() =>
                  unstable_batchedUpdates(() => {
                    // eslint-disable-next-line functional/no-expression-statements
                    Effect.all(ss.map(f => f(s))).pipe(Effect.runSync)
                  }),
                ),
              ),
            ),
          ),
          Effect.map(([_]) => _),
        ),
      ),
    ),
  query: <B, E, R>(
    effect: Effect.Effect<B, E, R | InternalStateRef<RootState>>,
  ) =>
    pipe(
      tag,
      Effect.flatMap(_ => Ref.get(_.ref)),
      Effect.flatMap(s =>
        Ref.make(s).pipe(
          Effect.flatMap(ref =>
            pipe(effect, Effect.provideService(stateTag<RootState>(), ref)),
          ),
        ),
      ),
    ),
}

import * as Context from '@effect/data/Context'
import { F, O, Optic, Option, Stream, SubscriptionRef, flow, pipe } from 'fp'
import { RootState } from 'src/model'

export type AppStateRef = SubscriptionRef.SubscriptionRef<RootState>

export const AppStateRefEnv = Context.Tag<AppStateRef>()

// const preparedSubscriptionRef = <A>(
//   ref: SubscriptionRef.SubscriptionRef<A>,
// ) => ({
//   changes: ref.changes,
//   get: SubscriptionRef.get(ref),
//   set: (a: A) => SubscriptionRef.set(ref, a),
//   update: (f: (a: A) => A) => SubscriptionRef.update(ref, f),
//   modify: <B>(f: (a: A) => readonly [B, A]) => SubscriptionRef.modify(ref, f),
// })

const preparedSubscriptionRefFromService = <A>(
  tag: Context.Tag<
    SubscriptionRef.SubscriptionRef<A>,
    SubscriptionRef.SubscriptionRef<A>
  >,
) => ({
  changes: Stream.flatMap(tag, env => env.changes),
  get: F.flatMap(tag, SubscriptionRef.get),
  set: (a: A) => F.flatMap(tag, SubscriptionRef.set(a)),
  update: (f: (a: A) => A) => F.flatMap(tag, SubscriptionRef.update(f)),
  modify: <B>(f: (a: A) => readonly [B, A]) =>
    F.flatMap(tag, SubscriptionRef.modify(f)),
})

const StateRef_ = preparedSubscriptionRefFromService(AppStateRefEnv)

export const StateRef = {
  ...StateRef_,
  on: <B>(optic: Optic.PolyReversedPrism<RootState, RootState, B, B>) => ({
    changes: StateRef_.changes.pipe(Stream.map(r => Optic.get(optic)(r))),
    get: StateRef_.get.pipe(F.map(r => Optic.get(optic)(r))),
    set: (b: B) => StateRef_.update(Optic.replace(optic)(b)),
    update: (f: (b: B) => B) => StateRef_.update(Optic.modify(optic)(f)),
    modify: <C>(f: (b: B) => readonly [C, B]) =>
      StateRef_.modify<C>(r =>
        pipe(
          Optic.get(optic)(r),
          f,
          v => [v[0], Optic.replace(optic)(v[1])(r)] as const,
        ),
      ),
  }),
  onOption: <B>(optic: Optic.PolyOptional<RootState, RootState, B, B>) => ({
    changes: StateRef_.changes.pipe(Stream.map(r => Optic.getOption(optic)(r))),
    get: StateRef_.get.pipe(F.map(r => Optic.getOption(optic)(r))),
    set: (b: B) => StateRef_.update(Optic.replace(optic)(b)),
    update: (f: (b: B) => B) => StateRef_.update(Optic.modify(optic)(f)),
    modify: <C>(f: (b: B) => readonly [C, B]) =>
      StateRef_.modify<Option<C>>(r =>
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

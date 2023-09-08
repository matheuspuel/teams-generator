import * as Context from '@effect/data/Context'
import { F, Optic, S, Stream, SubscriptionRef } from 'fp'
import { RootState } from 'src/model'

export type AppStateRef = SubscriptionRef.SubscriptionRef<RootState>

export const AppStateRefEnv = Context.Tag<AppStateRef>()

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

export const StateRef = preparedSubscriptionRefFromService(AppStateRefEnv)

export const getSApp: <A>(
  optic: Optic.PolyReversedPrism<RootState, RootState, A, A>,
) => S.State<RootState, A> = optic => S.gets(Optic.get(optic))

export const modifySApp: <A, B>(
  optic: Optic.PolyOptional<RootState, RootState, A, B>,
) => (f: (a: A) => B) => S.State<RootState, void> = optic => f =>
  S.modify(Optic.modify(optic)(f))

export const replaceSApp: <A>(
  optic: Optic.PolySetter<RootState, RootState, A>,
) => (a: A) => S.State<RootState, void> = optic => a =>
  S.modify(Optic.replace(optic)(a))

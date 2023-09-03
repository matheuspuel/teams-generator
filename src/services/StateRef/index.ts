import * as Context from '@effect/data/Context'
import { Effect, F, Optic, S, Stream, SubscriptionRef } from 'fp'
import { RootState } from 'src/model'

export type AppStateRef = SubscriptionRef.SubscriptionRef<RootState>

export const AppStateRefEnv = Context.Tag<AppStateRef>()

export const changes: Stream.Stream<AppStateRef, never, void> = Stream.flatMap(
  AppStateRefEnv,
  env => env.changes,
)

export const execute = <A>(
  f: S.State<RootState, A>,
): Effect<AppStateRef, never, A> =>
  F.flatMap(AppStateRefEnv, env => SubscriptionRef.modify(env, f))

export const getRootState = S.get<RootState>()

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

import * as Context from '@effect/data/Context'
import { Effect, F, Optic, S } from 'fp'
import { RootState } from 'src/model'
import { StateRef } from 'src/utils/datatypes'

export type AppStateRef = StateRef<RootState>

export const AppStateRefEnv = Context.Tag<AppStateRef>()

export const subscribe: (
  effect: Effect<never, never, void>,
) => Effect<
  AppStateRef,
  never,
  { unsubscribe: Effect<never, never, void> }
> = f => F.flatMap(AppStateRefEnv, env => env.subscribe(f))

export const execute = <A>(
  f: S.State<RootState, A>,
): Effect<AppStateRef, never, A> =>
  F.flatMap(AppStateRefEnv, env => env.execute(f))

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

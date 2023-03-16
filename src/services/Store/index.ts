import { $, Optic, ReaderIO, S } from 'fp'
import { Endomorphism } from 'fp-ts/Endomorphism'
import { RootState } from 'src/model'
import { Store } from 'src/utils/store'

export type AppStore = Store<RootState>

export type AppStoreEnv = { store: AppStore }

export const execute =
  <A>(f: S.State<RootState, A>) =>
  (env: AppStoreEnv) =>
    env.store.execute(f)

export const storeGet = (env: AppStoreEnv) => env.store.execute(S.get())

export const dispatch =
  (action: Endomorphism<RootState>): ReaderIO<AppStoreEnv, void> =>
  env =>
    env.store.execute(S.modify(action))

const modifyRoot = (f: Endomorphism<RootState>) => S.modify(f)

export const modifySApp: <A, B>(
  optic: Optic.PolyOptional<RootState, RootState, A, B>,
) => (f: (a: A) => B) => S.State<RootState, void> = optic => f =>
  $(Optic.modify(optic)(f), modifyRoot)

export const replaceSApp: <A>(
  optic: Optic.PolySetter<RootState, RootState, A>,
) => (a: A) => S.State<RootState, void> = optic => a =>
  $(Optic.replace(optic)(a), modifyRoot)

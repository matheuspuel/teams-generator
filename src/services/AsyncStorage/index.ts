/* eslint-disable functional/functional-parameters */
import { Context, Eff, Effect, Option } from 'fp'

export type AsyncStorage = {
  getItem: (key: string) => Effect<never, unknown, Option<string>>
  setItem: (key: string) => (value: string) => Effect<never, unknown, void>
  removeItem: (key: string) => Effect<never, unknown, void>
}

export type AsyncStorageEnv = { AsyncStorage: AsyncStorage }

export const AsyncStorageEnv = Context.Tag<AsyncStorageEnv>()

export const AsyncStorage = {
  getItem: (...args: Parameters<AsyncStorage['getItem']>) =>
    Eff.flatMap(AsyncStorageEnv, env => env.AsyncStorage.getItem(...args)),
  setItem:
    (...args: Parameters<AsyncStorage['setItem']>) =>
    (...args2: Parameters<ReturnType<AsyncStorage['setItem']>>) =>
      Eff.flatMap(AsyncStorageEnv, env =>
        env.AsyncStorage.setItem(...args)(...args2),
      ),
  removeItem: (...args: Parameters<AsyncStorage['removeItem']>) =>
    Eff.flatMap(AsyncStorageEnv, env => env.AsyncStorage.removeItem(...args)),
}
